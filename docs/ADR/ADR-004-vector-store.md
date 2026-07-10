# ADR-004: Vector Store

## Status
Accepted

## Context
The RAG system needs to store and query vector embeddings for:
- Document chunks (768-dimensional vectors)
- Similarity search for semantic retrieval
- Hybrid search combining vector + full-text

## Decision
Use pgvector (PostgreSQL extension).

## Rationale
- **Same database**: No separate vector database needed
- **HNSW indexing**: Fast approximate nearest neighbor search
- **ACID compliance**: Vectors are stored with case data
- **Supabase native**: pgvector is pre-installed
- **Prisma compatible**: Raw SQL for vector operations

## Consequences
- Vector operations require raw SQL (Prisma doesn't support vectors)
- Performance may degrade at very large scale (> 1M vectors)
- Backup/restore includes vector data (large files)

## Alternatives Considered
- **Qdrant**: Fast, open-source, but adds infrastructure
- **Pinecone**: Managed, but expensive and vendor lock-in
- **Weaviate**: Feature-rich, but complex setup
- **Milvus**: High performance, but requires Kubernetes

## Date
2024-01-15
