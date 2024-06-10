# GamerChat

Created by:
- Alan Shirk
- Joseph Gafron

Repository link: https://github.com/ashirk94/GamerChat

Our GamerChat project uses a Model-View-Controller architecture and separates the frontend from the backend. The frontend, built with React and styled with custom CSS and Bootstrap, has multiple page components such as ProfilePage, ChatPage, and RegisterPage. Also it has a global navbar for easy navigation through our website. We used the react-bootstrap and react-toastify libraries to build a clean modern UI with error and success messages. State management is handled with the Redux Toolkit, which uses slices such as authSlice.js and usersApiSlice to manage authentication and API interactions efficiently. authSlice.js handles user login, logout, and session management, while usersApiSlice manages API calls related to user profiles and data fetching. 
    
We used js-cookie for handling JWT tokens, ensuring secure storage and retrieval of authentication tokens. The backend, implemented in Node.js with Express, manages user authentication, profile data, and real-time messaging via Socket.io. MongoDB is used as the database to store user information, messages, and other application data. Multer is used to handle profile picture uploading. Authentication middleware is implemented to protect routes, ensuring that only authenticated users can access pages of the application that contain user data. 

Vite is used as our build tool for React, which is a popular choice for current React development, allowing us to minify our frontend JavaScript code. For our testing framework, we used Jest. We also used Babel to convert our JavaScript code into a readable format for testing.

Our code is highly modularized and is separated into microservices to keep our code managable and adaptable.

We performed backend system tests, and some frontend feature and unit testing. We wrote 11 passing tests (4 on the backend, 7 on the frontend). We tested the Chat Page, Login Page, and Register Page. 

The front-end testing consisted of several page component tests. For the LoginPage we tested if it renders correctly, and whether or not the page gracefully handles errors when the login form is submitted without any data. For the ChatPage, we tested the Delete Chat and Clear Chat features. Finally, the RegisterPage was tested to check if the page correctly handles empty submitted forms, mismatching passwords, and if it renders the page correctly. 

Our system testing consisted of XSS Prevention, SQL Injection Prevention, a health check, and a nonexistent route check. Our tests mocked the database connection using 'jest.mock', and configured an Express application with custom logging middleware. The health check tests whether the server is running and if express is routing properly and sending data with a POST request. Lastly, our non-existent route test evaluates whether non-existent routes respond with the proper error (404). 

In order to run our tests, run following commands, starting from the root directory:

```
cd server
npm test
cd ../client
npm test
```

To run our project locally, run the following commands, starting from the root directory:
```
npm install
cd server
npm install
cd ../client
npm install
cd ..
npm run dev
```

We have both direct messages to specific users and group chat functionality implemented on the chat page, however in order to switch between a direct chat and a group chat room, the page must be refreshed. All messages from the user's chats will appear when the page is first loaded, and then the messages will be filtered once a room is selected. This bug was introduced when group chat was implemented, but since group chat is working properly, and we are out of time to update the project further, we are turning the project in as is. There is also an issue with dates in the group chat, but the bug appears to affect the frontend only and the proper date and time displays upon refresh. 

The application is also running on a Heroku server.

Live server link: https://gamer-chat-161acd6cf748.herokuapp.com/
