import { useState } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

async function readAssistantStream(response, onText) {
  if (!response.body) {
    throw new Error('The assistant returned an empty response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function processEvent(event) {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.replace(/^data:\s*/, '').trim())
      .join('');

    if (!data || data === '[DONE]') {
      return;
    }

    const parsed = JSON.parse(data);

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    const text =
      parsed.text ||
      parsed.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('') ||
      '';

    if (text) {
      onText(text);
    }
  }

  while (true) {
    const { done, value } = await reader.read();

    buffer += decoder.decode(value || new Uint8Array(), {
      stream: !done,
    });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || '';

    events.forEach(processEvent);

    if (done) {
      break;
    }
  }

  if (buffer.trim()) {
    processEvent(buffer);
  }
}

function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError('Please enter a prompt first.');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setResponse('');
    setError('');

    let fullText = '';

    try {
      const assistantResponse = await fetch(
        `${BACKEND_URL}/api/ai/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: trimmedPrompt,
          }),
        },
      );

      if (!assistantResponse.ok) {
        const errorBody = await assistantResponse
          .json()
          .catch(() => ({}));

        throw new Error(
          errorBody.message ||
            errorBody.error ||
            `Server error: ${assistantResponse.status}`,
        );
      }

      await readAssistantStream(assistantResponse, (text) => {
        fullText += text;
        setResponse(fullText);
      });

      if (!fullText.trim()) {
        throw new Error('The assistant returned no response.');
      }

      setHistory((previousHistory) =>
        [
          {
            prompt: trimmedPrompt,
            answer: fullText,
          },
          ...previousHistory,
        ].slice(0, 3),
      );

      setPrompt('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="ai-assistant-page">
      <div className="ai-assistant-content">
        <Link className="back-to-login-button" to="/login">
          Back to Login
        </Link>

        <h1>AI Assistant</h1>

        <form className="ai-assistant-form" onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setError('');
            }}
            placeholder="Ask something..."
            disabled={isLoading}
            rows="5"
          />

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 'Generating...' : 'Submit'}
          </button>
        </form>

        {error && (
          <p className="ai-assistant-error" role="alert">
            {error}
          </p>
        )}

        {isLoading && !response && (
          <p className="ai-assistant-loading" role="status">
            Gemini is thinking...
          </p>
        )}

        {response && (
          <section className="ai-assistant-response" aria-live="polite">
            <h2>Assistant Response</h2>
            <pre>{response}</pre>
          </section>
        )}

        <section className="ai-assistant-history">
          <h2>Recent History</h2>

          {history.length === 0 && (
            <p>No questions asked yet.</p>
          )}

          {history.map((item, index) => (
            <article
              className="ai-history-item"
              key={`${item.prompt}-${index}`}
            >
              <strong>Q:</strong> {item.prompt}
              <br />
              <strong>A:</strong> {item.answer}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default AIAssistant;
