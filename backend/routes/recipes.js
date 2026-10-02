const express = require('express');
const router = express.Router();

const recipesController = require('../controllers/recipes');
const verifyToken = require('../middleware/verifyToken');

router.get('/', recipesController.getAll);
router.get('/:id', recipesController.getOne);

router.post('/', verifyToken, recipesController.create);
router.put('/:id', verifyToken, recipesController.update);
router.delete('/:id', verifyToken, recipesController.delete);

router.post(
  '/:id/instructions',
  verifyToken,
  recipesController.addInstruction,
);

router.put(
  '/:id/instructions/:instructionId',
  verifyToken,
  recipesController.updateInstruction,
);

router.delete(
  '/:id/instructions/:instructionId',
  verifyToken,
  recipesController.deleteInstruction,
);

module.exports = router;
