# APP

## Getting Started

1. Create a .env file `cp .env.example .env`
2. Create DB on local machine `npm run db:setup`
3. Install dependencies`npm install`
4. Start application`npm start`
5. (Optional) Seed DB `npm run db:seed`

## Example queries

#### Query all Posts

```gql
query posts {
  posts {
    id
    title
    text
  }
}
```

#### Query one Post

```gql
query getPost {
  post(id: 1) {
    id
    title
    text
  }
}
```

#### Create a Post

```gql
mutation addPost {
  addPost(title: "Title", text: "text") {
    id
    title
    text
  }
}
```

#### Delete a Post

```gql
mutation deletePost {
  deletePost(id: 1)
}
```
