const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

// CRUD Routes
router.post('/', ruleController.createRule);
router.get('/', ruleController.getAllRules);
router.get('/:id', ruleController.getRule);
router.put('/:id', ruleController.updateRule);
router.delete('/:id', ruleController.deleteRule);

module.exports = router;