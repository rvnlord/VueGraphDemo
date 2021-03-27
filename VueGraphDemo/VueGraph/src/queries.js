import { gql } from "apollo-boost";

// #region POSTS QUERIES

export const GET_POSTS = gql`
    query {
        getPosts {
            _id
            title
            imageUrl
        }
    }
`;

export const GET_POST = gql`
    query($postId: ID!) {
        getPost(postId: $postId) {
            _id
            title
            imageUrl
            categories
            description
            likes
            createdDate
            messages {
                _id
                messageBody
                messageDate
                messageUser {
                    _id
                    userName
                    avatar
                }
            }
        }
    }
`;

export const INFINITE_SCROLL_POSTS = gql`
    query(
        $pageNum: Int!,
        $pageSize: Int!    
    ) {
        infiniteScrollPosts(
            pageNum: $pageNum, 
  	        pageSize: $pageSize
        ) {
            hasMore
            posts {
                _id
                title
                imageUrl
                categories
                description
                likes
                createdDate
                messages {
                    _id
                }
                createdBy {
                    _id
                    userName
                    avatar
                }
            }
        }
    }
`;

export const SEARCH_POSTS = gql`
    query($searchTerm: String) {
        searchPosts(
            searchTerm: $searchTerm
        ) {
            _id
            title
            description
            imageUrl
            likes
        }
    }
`;

export const GET_USER_POSTS = gql`
    query(
        $userId: ID!
    ) {
        getUserPosts(
            userId: $userId
        ) {
            _id
            title
            imageUrl
            description
            categories
            createdDate
            likes
        }
    }
`;

// #endregion

// #region USER QUERIES

export const GET_CURRENT_USER = gql`
    query {
        getCurrentUser {
            _id
            userName
            email
            password
            avatar
            joinDate
            favorites {
                _id
                title
                imageUrl
            }
        }
    }
`;

// #endregion

// #region POSTS MUTATIONS

export const ADD_POST = gql`
    mutation(
        $title: String!,
        $imageUrl: String!,
        $categories: [String]!,
        $description: String!,
        $creatorId: ID!
    ) {
        addPost(
            title: $title, 
  	        imageUrl: $imageUrl,
            categories: $categories,
            description: $description,
            creatorId: $creatorId
        ) {
            _id
            title
            imageUrl
            categories
            description
        }
    }
`;

export const ADD_POST_MESSAGE = gql`
    mutation(
        $messageBody: String!,
        $userId: ID!,
        $postId: ID!
    ) {
        addPostMessage(
            messageBody: $messageBody
            userId: $userId
            postId: $postId
        ) {
            _id
            messageBody
            messageDate
            messageUser {
                _id
                userName
                avatar
            }
        }
    }
`;

export const LIKE_POST = gql`
    mutation(
        $postId: ID!, 
        $userName: String!
    ) {
        likePost(
            postId: $postId, 
            userName: $userName
        ) {
            likes
            favorites {
                _id
                title
                imageUrl
            }
        }
    }
`;

export const UNLIKE_POST = gql`
    mutation(
        $postId: ID!, 
        $userName: String!
    ) {
        unlikePost(
            postId: $postId, 
            userName: $userName
        ) {
            likes
            favorites {
                _id
                title
                imageUrl
            }
        }
    }
`;

export const UPDATE_USER_POST = gql`
    mutation(
        $postId: ID!
        $userId: ID!
        $title: String!
        $imageUrl: String!
        $categories: [String]!
        $description: String!
    ) {
        updateUserPost(
            postId: $postId
            userId: $userId
            title: $title
            imageUrl: $imageUrl
            categories: $categories
            description: $description
        ) {
            _id
            title
            imageUrl
            description
            categories
            createdDate
            likes
            createdBy {
                _id
                avatar
            }
        }
    }
`;

export const DELETE_USER_POST = gql`
    mutation(
        $postId: ID!
    ) {
        deleteUserPost(
            postId: $postId
        ) {
            _id
        }
    }
`;

// #endregion

// #region USER MUTATIONS

export const SIGNIN_USER = gql`
    mutation($userName: String!, $password: String!) {
        signinUser(userName: $userName, password: $password) {
            token
        }
    }
`;

export const SIGNUP_USER = gql`
    mutation($userName: String!, $email: String!, $password: String!) {
        signupUser(userName: $userName, email: $email, password: $password) {
            token
        }
    }
`;

// #endregion