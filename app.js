    const express = require('express');
    const app = express();
    const port = 3000;
    app.set('view engine', 'ejs');
    app.set('views', './views');
    const path = require('path');
    const cors = require('cors');
    require('dotenv').config(); 
    const baseURL = process.env.BASE_URL;

   app.use(cors());

   app.use(express.static(path.join(__dirname, 'public')));
   app.use('/uploads', express.static('uploads'));

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

   app.use((req, res, next) => {
    req.baseUrlFull = `${req.protocol}://${req.get('host')}`;
      console.log(`${req.method} request for ${req.url}`);
      next();
   });
  
 
   app.get('/cronsetup', (req, res) => {
    const setupCronJobs = require('./routes/cronsetup');
      setupCronJobs();
      res.json({sucess:'true'});
    }); 

    const setupCronJobs = require('./routes/cronsetup');
    setupCronJobs();

    const indexRoutes = require('./routes/index');
    app.use('/', indexRoutes);

   
  