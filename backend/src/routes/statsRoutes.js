const express = require('express');
const router = express.Router();
const { getHomepageStats } = require('../controllers/statsController');

router.get('/homepage', getHomepageStats);

module.exports = router;
