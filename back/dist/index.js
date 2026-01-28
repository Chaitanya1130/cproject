import express from 'express';
const app = express();
app.get('/firstCheck', (req, res) => {
    res.send("Hey wow what a craxy thing");
});
app.listen(8000);
//# sourceMappingURL=index.js.map