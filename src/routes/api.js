import express from 'express';

const router = new express.Router();

/**
 * GET home page
 *
 * This is the list of relevant bills for the user
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "JUST A TEST, replace these :)"
  });
});

export default router;
