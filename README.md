# TransferSecure

**Contributors**:

- Temitope Ajanaku
- Đỗ Phạm Huy Khánh
- Omieibi Bagshaw
- Akanksha Singh
- Durga Upadhyaya
- Dominic Huy Nguyễn

**Description**:
TransferSecure is a web application that provides a secure and efficient solution for **data transfer** between users.  
The project consists of two main parts: **Backend (Node.js/Express/TypeScript)** and **Frontend (React)**.

**Basic User Flow**:

A user begins by creating an account on the system.  
Once registered, the user can upload a file and specify the recipient’s email address.  
The system automatically scans the uploaded file for malware.

- If malware is detected, the transfer is blocked and the user is notified.
- If the file is clean, the system generates a secure download link.

Finally, the recipient is notified by email and can use the secure link to download the file.

**Website link**: https://main.dw0t9e0p5k4fj.amplifyapp.com/

**How To Run Locally**:

### 1. Clone the repository

```sh
git clone https://github.com/Gracetemitope/TransferSecure.git
cd TransferSecure
```

### 2. Backend (Server)

#### Navigate to backend folder

```sh
cd transfersecure-server
```

#### Install dependencies

```sh
npm install
```

#### Build TypeScript source

```sh
npm run build
```

#### Start the server

```sh
npm run start
```

#### By default, the backend runs at:

```bash
http://127.0.0.1:8080/
```

### 3. Frontend (Client)

#### Navigate to frontend folder

```sh
cd ../transfersecure-client
```

#### Install dependencies

```sh
npm install
```

#### Start the client

```sh
npm run start
```

#### By default, the frontend runs at:

```bash
http://localhost:3000
```

**License**:
The TransferSecure project is developed for learning and research purposes.
