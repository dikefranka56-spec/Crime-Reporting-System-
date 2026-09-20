const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Generate Tracking ID like FPNO-2026-1234
function generateTrackingId() {
  return 'FPNO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
}

// 1. CREATE NEW REPORT (Anonymous)
router.post('/', async (req, res) => {
  try {
    const { crimeType, location, description, dateOfIncident, contactInfo } = req.body;
    
    const newReport = new Report({
      trackingId: generateTrackingId(),
      crimeType,
      location,
      description,
      dateOfIncident,
      contactInfo: contactInfo || 'Anonymous'
    });

    const savedReport = await newReport.save();
    res.status(201).json({ 
      message: 'Report submitted successfully',
      trackingId: savedReport.trackingId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL REPORTS (For Admin)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. TRACK REPORT BY ID (For Student)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const report = await Report.findOne({ trackingId: req.params.trackingId });
    if (!report) return res.status(404).json({ message: 'Tracking ID not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE REPORT STATUS (For Admin)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, officerRemark: req.body.officerRemark },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
