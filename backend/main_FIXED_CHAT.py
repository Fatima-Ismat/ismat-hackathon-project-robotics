# REPLACE THE /chat ENDPOINT IN main.py WITH THIS CODE

@app.post("/chat")
async def chat_endpoint(
    request_obj: Request,
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_session),
):
    """
    Main chat endpoint with streaming support using LiteLLM.
    FULLY FIXED VERSION with proper error handling.
    """
    try:
        logger.info(f"[CHAT] Request from session {chat_request.session_id}")
        logger.info(f"[CHAT] Message: {chat_request.message[:100]}")

        # Load conversation history
        history = await load_history(chat_request.session_id, db, limit=10)
        logger.info(f"[CHAT] Loaded {len(history)} history messages")

        # Save user message
        await save_message(
            session_id=chat_request.session_id,
            role="user",
            content=chat_request.message,
            db=db
        )
        logger.info(f"[CHAT] Saved user message to DB")

        # Retrieve relevant chunks from Qdrant
        logger.info(f"[CHAT] Retrieving chunks from Qdrant...")
        context = retrieve_chunks(
            chat_request.message,
            chat_request.selected_text or ""
        )
        logger.info(f"[CHAT] Retrieved context: {len(context)} chars")

        # Build messages for LiteLLM
        system_prompt = f"""You are a precise tutor for the Physical AI & Humanoid Robotics book.

CRITICAL RULES:
1. Answer ONLY from the provided book content below
2. If selected text is provided, prioritize it in your answer
3. If no relevant information found, say: "I cannot find information about this in the book."
4. Be helpful, honest, and harmless
5. Structure answers clearly with examples when appropriate
6. ALWAYS include Roman Urdu translation at the end

BOOK CONTENT:
{context}
"""

        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        for msg in history[-5:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message
        messages.append({"role": "user", "content": chat_request.message})

        logger.info(f"[CHAT] Prepared {len(messages)} messages for LiteLLM")
        logger.info(f"[CHAT] Using model: {LITELLM_MODEL}")

        # Stream response generator
        async def generate_response():
            """Generate SSE stream from LiteLLM with full error handling."""
            full_response = ""

            try:
                logger.info(f"[CHAT] Calling LiteLLM completion API...")

                # Test OpenAI API key
                import os
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    error_msg = "ERROR: OPENAI_API_KEY not found in environment"
                    logger.error(f"[CHAT] {error_msg}")
                    yield f"data: {error_msg}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                if not api_key.startswith("sk-"):
                    error_msg = "ERROR: OPENAI_API_KEY format invalid (should start with sk-)"
                    logger.error(f"[CHAT] {error_msg}")
                    yield f"data: {error_msg}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                logger.info(f"[CHAT] API key found: {api_key[:15]}...")

                # Call LiteLLM with streaming
                try:
                    response = completion(
                        model=LITELLM_MODEL,
                        messages=messages,
                        stream=True,
                        max_tokens=2000,
                        temperature=0.7,
                        api_key=api_key  # Explicitly pass API key
                    )
                    logger.info(f"[CHAT] LiteLLM response stream started")
                except Exception as completion_error:
                    logger.error(f"[CHAT] LiteLLM completion() failed: {completion_error}", exc_info=True)
                    error_msg = f"LiteLLM Error: {str(completion_error)[:200]}"
                    yield f"data: {error_msg}\n\n"
                    yield "data: [DONE]\n\n"
                    return

                # Process streaming response
                chunk_count = 0
                for chunk in response:
                    chunk_count += 1

                    if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            content = delta.content
                            full_response += content
                            yield f"data: {content}\n\n"

                    if chunk_count % 10 == 0:
                        logger.info(f"[CHAT] Processed {chunk_count} chunks, {len(full_response)} chars")

                logger.info(f"[CHAT] Streaming complete: {chunk_count} chunks, {len(full_response)} total chars")

                # Save assistant response
                if full_response:
                    try:
                        await save_message(
                            session_id=chat_request.session_id,
                            role="assistant",
                            content=full_response,
                            db=db
                        )
                        logger.info(f"[CHAT] Saved assistant response to DB")
                    except Exception as save_error:
                        logger.error(f"[CHAT] Failed to save response: {save_error}")

                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"[CHAT] Stream generation error: {e}", exc_info=True)
                error_msg = f"Error: {type(e).__name__}: {str(e)[:200]}"
                yield f"data: {error_msg}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        logger.error(f"[CHAT] Endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chat endpoint failed: {str(e)}"
        )
