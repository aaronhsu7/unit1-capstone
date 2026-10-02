// filename: backend/models/recipe.js
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: false },
});

const instructionSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  description: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    ingredients: [ingredientSchema],
    instructions: [instructionSchema],
    tags: [String],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Recipe', recipeSchema);
