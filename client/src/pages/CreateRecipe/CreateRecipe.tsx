import { type FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CreateRecipe.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type RecipeForm = {
  title: string;
  ingredients: string;
  instructions: string;
  tags: string;
};

type Ingredient = {
  name: string;
  quantity?: string;
};

type Instruction = {
  step: number;
  description: string;
};

type Recipe = {
  title: string;
  image?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags?: string[];
};

type RecipeResponse = Recipe | { recipe: Recipe };

const initialForm: RecipeForm = {
  title: '',
  ingredients: '',
  instructions: '',
  tags: '',
};

function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  );
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<RecipeForm>(initialForm);
  const [imageData, setImageData] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function loadRecipe() {
      const token = getToken();

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data } = await axios.get<RecipeResponse>(
          `${BACKEND_URL}/api/recipes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const recipe = 'recipe' in data ? data.recipe : data;

        setForm({
        title: recipe.title,

        ingredients: recipe.ingredients
            .map((ingredient) =>
            [ingredient.quantity, ingredient.name]
                .filter(Boolean)
                .join(' '),
            )
            .join('\n'),

        instructions: [...recipe.instructions]
            .sort((a, b) => a.step - b.step)
            .map((instruction) => instruction.description)
            .join('\n'),

        tags: recipe.tags?.join(', ') || '',
        });


        setImageData(recipe.image || '');
      } catch {
        setError('Recipe could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadRecipe();
  }, [id, navigate]);

  function updateField(field: keyof RecipeForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError('');
  }

    function handleImageChange(value: string) {
    setImageData(value);
    setError('');
    }

    function parseIngredients(value: string): Ingredient[] {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name) => ({
        name,
        }));
    }

  function parseInstructions(value: string): Instruction[] {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((description, index) => ({
        step: index + 1,
        description: description.replace(/^\d+[\s.)-]+/, '').trim(),
      }));
  }

  function parseTags(value: string) {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const token = getToken();
    const ingredients = parseIngredients(form.ingredients);
    const instructions = parseInstructions(form.instructions);

    if (
        !form.title.trim() ||
        ingredients.length === 0 ||
        instructions.length === 0 ||
        !form.tags.trim() ||
        !imageData
    ) {
        setError(
        'Please complete the title, ingredients, instructions, tags, and image.',
        );
        return;
    }

    if (!token) {
        navigate('/login', { replace: true });
        return;
    }

    const payload = {
        title: form.title.trim(),
        ingredients,
        instructions,
        tags: parseTags(form.tags),
        image: imageData,
    };

    try {
        setIsSubmitting(true);

        if (isEditing && id) {
        await axios.put(`${BACKEND_URL}/api/recipes/${id}`, payload, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        } else {
        await axios.post(`${BACKEND_URL}/api/recipes`, payload, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        }

        navigate('/dashboard', {
        replace: true,
        state: {
            successMessage: isEditing
            ? 'Recipe updated successfully!'
            : 'Recipe created successfully!',
        },
        });
    } catch (requestError) {
        if (axios.isAxiosError(requestError)) {
        setError(
            requestError.response?.data?.message ||
            'Recipe could not be saved.',
        );
        } else {
        setError('Recipe could not be saved.');
        }
    } finally {
        setIsSubmitting(false);
    }
    }

  if (isLoading) {
    return (
      <main className="create-recipe-page">
        <section className="create-recipe-card">
          <p>Loading recipe...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="create-recipe-page">
      <section className="create-recipe-card">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate('/dashboard')}
        >
          ← Back
        </button>

        <h1>{isEditing ? 'Edit Recipe' : 'Create Recipe'}</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="recipe-title">Title</label>
          <input
            id="recipe-title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />

          <label htmlFor="recipe-ingredients">Ingredients</label>
          <textarea
            id="recipe-ingredients"
            rows={6}
            value={form.ingredients}
            onChange={(event) =>
              updateField('ingredients', event.target.value)
            }
            required
          />

          <label htmlFor="recipe-instructions">Instructions</label>
          <textarea
            id="recipe-instructions"
            rows={7}
            value={form.instructions}
            onChange={(event) =>
              updateField('instructions', event.target.value)
            }
            required
          />

          <label htmlFor="recipe-tags">Tags</label>
          <input
            id="recipe-tags"
            value={form.tags}
            onChange={(event) => updateField('tags', event.target.value)}
            required
          />

            <label htmlFor="recipe-image">Image URL</label>
            <input
                id="recipe-image"
                type="url"
                value={imageData}
                placeholder="https://i.imgur.com/example.jpg"
                onChange={(event) => handleImageChange(event.target.value)}
                required
            />
            <small>
            Paste a direct image link from Imgur or another image-hosting site.
            </small>

          {imageData && (
            <img
              className="recipe-form-image-preview"
              src={imageData}
              alt="Current recipe"
            />
          )}

          {error && (
            <p className="recipe-message recipe-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="save-recipe-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </form>
      </section>
    </main>
  );
}
