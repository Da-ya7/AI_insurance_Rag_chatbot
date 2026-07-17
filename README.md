# Insurance AI Assistant

<p align="center">
  <img src="https://raw.githubusercontent.com/Da-ya7/AI_insurance_Rag_chatbot/main/.github/assets/banner.svg" alt="Insurance AI Assistant banner" width="100%">
</p>

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python"></a>
  <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0F969C?logo=fastapi&logoColor=white" alt="FastAPI"></a>
  <a href="https://www.trychroma.com/"><img src="https://img.shields.io/badge/ChromaDB-000000?logo=chroma&logoColor=white" alt="ChromaDB"></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="https://github.com/Da-ya7/AI_insurance_Rag_chatbot/actions/workflows/ci.yml"><img src="https://github.com/Da-ya7/AI_insurance_Rag_chatbot/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/github/last-commit/Da-ya7/AI_insurance_Rag_chatbot?style=flat-square" alt="Last commit">
</p>

<p align="center">
  A production-style retrieval-augmented insurance assistant built with FastAPI. It answers questions strictly from uploaded policy PDFs, stores embeddings in ChromaDB, persists chat history in MySQL, and uses grounded prompts to reduce hallucinations.
</p>

## Highlights

- Upload insurance PDFs and index them for semantic search.
- Ask policy questions through a simple web UI or API.
- Return grounded answers with a safe fallback when the documents do not contain enough context.
- Capture feedback and chat history for traceability.

## Tech Stack

FastAPI, Groq LLM, ChromaDB, MySQL, SQLAlchemy, PyMuPDF, Sentence Transformers, Pydantic, Jinja templates, and vanilla JavaScript.

## Prerequisites

- Python 3.11 or newer
- MySQL running locally or remotely
- A Groq API key
- A Gemini API key if you plan to keep the current configuration contract in sync with your environment settings

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env` with your credentials and database URL before starting the app:

```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
MYSQL_URL=mysql+pymysql://user:password@localhost:3306/insurance_ai
```

Create the database first:

```sql
CREATE DATABASE insurance_ai;
```

The tables are created automatically on startup. For the chat UI, insert the demo user used by the current workflow:

```sql
INSERT INTO users (name, email) VALUES ('Demo User', 'demo@example.com');
```

## Run the App

```bash
uvicorn main:app --reload
```

Open http://localhost:8000 in your browser.

## API Flow

1. `POST /api/upload-document` uploads a PDF, extracts text, chunks content, generates embeddings, and stores records in ChromaDB and MySQL.
2. `POST /api/chat` embeds the question, runs similarity search, builds a grounded prompt, generates an answer, validates the result, and saves the exchange.
3. `GET /api/chat-history/{user_id}` returns prior conversations for a user.
4. `POST /api/feedback` stores thumbs-up or thumbs-down feedback with an optional comment.
5. `GET /api/health` returns a simple health check.

## Project Layout

```
app/
  api/routes/        API endpoints for chat, documents, history, and feedback
  services/          PDF loading, embeddings, LLM access, chat orchestration, validation
  database/          SQLAlchemy models and session management
  vectorstore/       ChromaDB client and retrieval helpers
  prompts/           Prompt builder and grounding rules
  schemas/           Request and response models
static/, templates/  Minimal browser UI
tests/               Pytest-based tests
```

## Demo Checklist

1. Start the server and upload a sample insurance PDF.
2. Ask a question that can be answered from the document and verify the grounded response.
3. Ask a question outside the source material and confirm the safe fallback message.
4. Show chat history to demonstrate persistence.

## Notes

- Local environment files, vector store data, and uploaded insurance PDFs are ignored from version control.
- If you want, the next step is to add Docker and a deployment workflow for GitHub Actions.
