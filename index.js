const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const submissionRoutes = require('./routes/submissionRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const fileUpload = require('express-fileupload');



dotenv.config();
connectDB();

const app = express();


app.use(cors({
    origin: '*', 
    credentials: true,
    exposedHeaders: ['Authorization'],
  }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));

  
app.use(express.json());
app.use(cookieParser());

app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/submissions', submissionRoutes);
app.use('/api', adminReportRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use('/api/disputes', disputeRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("api/comments",require("./routes/comment"));






const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
