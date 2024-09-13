# Kuroline

Kuroline is a real-time chat web application built using Angular. It leverages WebSocket for real-time communication and provides a seamless chat experience. This application supports user authentication, message sending, and message status updates.

## Features

- **Real-time Messaging**: Send and receive messages in real-time using WebSocket.
- **User Authentication**: Secure login and logout functionality.
- **Message Status Updates**: Track message statuses such as sent, delivered, and read.
- **Discussion Management**: Manage discussions and update message statuses within discussions.

## Technologies Used

- **Angular**: Frontend framework for building the user interface.
- **RxJS**: Reactive programming library for handling asynchronous events.
- **WebSocket**: Protocol for real-time communication.
- **TypeScript**: Superset of JavaScript for type-safe code.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- Angular CLI installed globally (`npm install -g @angular/cli`).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kuro-jojo/kuroline-angular.git
   cd kuroline-angular
   ```

2. Install the dependencies:
   ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    ng serve
    ```
4. Open your browser and navigate to `http://localhost:4200/`.

### Usage
#### Authentication
1. Register a new account by providing your email and password or using the Google sign-in option.
2. Log in using your registered email and password or using the Google sign-in option.
3. Log out of your account by clicking the logout button.

#### Messaging
1. Start a new discussion by locating the user you want to chat with and clicking the chat button.
2. Send a message by typing your message in the input field and pressing the send button.
3. View the status of your messages (sent, delivered, read) in the chat window.
4. Receive messages in real-time from other users.

#### Discussion Management
1. View all your discussions in the sidebar.
2. Click on a discussion to view the chat history and update message statuses.
3. Delete a discussion by clicking the delete button.

#### Code overview
##### Services
- **AuthenticationService**: Handles user authentication and provides methods for registering, logging in, and logging out.
- **DiscussionService**: Manages discussions and provides methods for creating, deleting, and updating discussions.
- **UserService**: Retrieves user information and provides methods for fetching user data.
- **WebSocketService**: Establishes a WebSocket connection and provides methods for sending and receiving messages.
- **ChatService**: Handles real-time messaging using WebSocket and provides methods for sending and receiving messages.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.