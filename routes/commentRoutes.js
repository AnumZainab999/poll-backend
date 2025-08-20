const router = require('express').Router();
const auth = require('../middleware/auth');
const { getComments, addComment } = require('../controllers/commentController');

router.get('/:pollId', getComments);
router.post('/:pollId', auth, addComment);

module.exports = router;