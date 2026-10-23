import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "node:fs/promises";
import path from "node:path";

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION ?? "accesspilot-policies-ollama";

const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

export async function indexPolicies() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "rag",
    "documents",
    "access-policies.txt",
  );

  console.log(`Loading policy document: ${filePath}`);

  const content = await readFile(filePath, "utf-8");

  const document = new Document({
    pageContent: content,
    metadata: {
      source: "access-policies.txt",
      type: "access-policy",
    },
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.splitDocuments([document]);

  console.log(`Created ${chunks.length} policy chunks.`);

  const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    embeddings,
    {
      url: QDRANT_URL,
      collectionName: COLLECTION_NAME,
    },
  );

  console.log(`Indexed policies into Qdrant collection: ${COLLECTION_NAME}`);

  return vectorStore;
}

export async function getPolicyRetriever() {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: QDRANT_URL,
      collectionName: COLLECTION_NAME,
    },
  );

  return vectorStore.asRetriever({
    k: 3,
  });
}
