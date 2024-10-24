import { Client, Databases, ID, Query } from "appwrite";

const client = new Client();

// const endpoint = import.meta.env.REACT_APP_APPWRITE_ENDPOINT!;
// const projectId = import.meta.env.REACT_APP_APPWRITE_PROJECT_ID!;

const databases = new Databases(client);

export { databases, ID, Query };
