# DocuMind

**DocuMind** is an intelligent document analysis and querying platform. It allows users to upload documents, process them into searchable vector embeddings, and interactively query their contents using AI-powered Retrieval-Augmented Generation (RAG).

## Setup Instructions

For detailed setup and installation instructions, please strictly refer to the `README.md` files located in their respective directories:

- [Frontend Setup Instructions](./frontend/README.md)
- [Backend Setup Instructions](./backend/README.md)

---

## What This Website Does

DocuMind acts as a smart, personal knowledge base. Instead of manually reading through lengthy PDF or text files to find specific information, you can simply upload your documents to DocuMind and chat with them. You ask questions in natural language, and the system intelligently retrieves the most relevant sections from your uploaded documents to generate accurate, context-aware answers.

## Key Features

- **Document Management:** Securely upload, store, and manage files (supports PDF and TXT).
- **Intelligent RAG Querying:** Ask naturally phrased questions and get AI-generated answers based strictly on your uploaded files.
- **Advanced Vector Search:** Automatic chunking and vector embedding of documents for fast, semantically accurate searches.
- **Secure Authentication:** Complete login and registration system with protected routes to keep your documents and query history private.
- **Analytics Dashboard:** View usage stats, document counts, and query analytics straight from the dashboard.
- **Asynchronous Processing:** Background workers smoothly handle heavy embedding tasks so the user interface remains snappy.
- **Optimized Performance:** Utilizes Redis caching and rate limiting for blazing-fast responses and robust reliability.
