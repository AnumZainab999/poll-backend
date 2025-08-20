const router = require('express').Router();
const auth = require('../middleware/auth');
const { createPoll, getActivePolls, getPollById, deletePoll, voteOnPoll,getPollStats } = require('../controllers/pollController');

router.get('/', getActivePolls);
router.get('/:id', getPollById);
router.post('/', auth, createPoll);
router.delete('/:id', auth, deletePoll);
router.post('/:id/vote', auth, voteOnPoll);
router.get('/:id/stats', getPollStats);

module.exports = router;