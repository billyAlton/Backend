# Backend

This repository contains the backend for the ECC Spirit and Life application, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node.js package manager)
- MongoDB (MongoDB Atlas cluster)

## Configuration

1. **Environment Variables**

- Create a `.env` file in the project root directory

- Copy the contents of [.env.example]into your new `.env` file

- Modify the following variables according to your environment:

```env
PORT=8002 # Port on which the server will listen
MONGO_URI=mongodb://localhost:27017/church # MongoDB connection URL
FRONTEND_URL="[https://eccespritetvie.com/](https://eccespritetvie.com/)" # Frontend URL (do not modify unless necessary or the domain changes)