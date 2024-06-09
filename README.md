# GamerChat

Created by:
- Alan Shirk
- Joseph Gafron

Repository link: https://github.com/ashirk94/GamerChat

Our GamerChat project is structured within two parts, the frontend and the backend. The frontend, built with React and styled with CSS, has multiple components such as ProfilePage and GroupChatPage, along with a fixed navbar for easy navigation. We used React libraries like react-bootstrap and react-toastify for the UI and notifications. State management is handled with the Redux Toolkit, which uses slices like authSlice.js and usersApiSlice to manage authentication and API interactions efficiently. authSlice.js handles user login, logout, and session management, while usersApiSlice manages API calls related to user profiles and data fetching. 
    
We used js-cookie for handling tokens, ensuring secure storage and retrieval of authentication tokens. The backend, implemented in Node.js with Express, manages user authentication, profile data, and real-time messaging via Socket.io. MongoDB is used as the database to store user information, messages, and other application data. For profile editing, Multer is used to handle file uploads, such as profile pictures. Middleware is implemented to protect routes, ensuring that only authenticated users can access certain parts of the application. Vite is used as the build tool for React, providing a fast and efficient development environment. For testing, Babel converts our format into a readable format for Jest, which we used to perform feature and system testing. 

We performed our backend system tests, and some frontend feature and unit testing. From these tests, we obtained 11 passing tests (4 on the backend, 7 on the frontend). We tested the Chat Page, Login Page, and Register Page. 

The front-end testing consisted of a few different tests. For the Login Page we tested that the Login Page renders correctly, and whether or not the page gracefully handles errors when the login form is empty. For the Chat Page, we tested both the Delete Chat and Clear Chat features. Finally, the Register Page was tested to check if the page correctly handles empty submitted forms, mismatching passwords, and renders the page correctly. 

Our system testing consisted of checking for XSS Prevention and No-SQL Injection Prevention. Our tests mocked the database connection using 'jest.mock', and configured an Express application with custom logging middleware. The testing also performs a health check to see the application is up, and whether non-existent routes deliver the necessary error (404). 

In order to run the tests, run following commands:

```
cd server
npm test
cd ../client
npm test
```

To run the project locally, run the following command in the root directory:
```
npm run dev
```

The application is also running on a Heroku server.

Live server link: https://gamer-chat-161acd6cf748.herokuapp.com/
