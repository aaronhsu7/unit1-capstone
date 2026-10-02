import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type Recipe = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  tags?: string[];
  createdAt?: string;
};

type RecipeResponse = Recipe[] | { recipes?: Recipe[] };

type DashboardLocationState = {
  successMessage?: string;
};

function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken')
  );
}

function formatDate(value?: string) {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  }).format(date);
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState(
    (location.state as DashboardLocationState | null)?.successMessage || '',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState('');

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => {
    if (!normalizedSearchTerm) return true;

    const searchableText = [
      recipe.title,
      recipe.description,
      ...(recipe.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  useEffect(() => {
    async function loadRecipes() {
      const token = getToken();

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data } = await axios.get<RecipeResponse>(
          `${BACKEND_URL}/api/recipes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setRecipes(Array.isArray(data) ? data : data.recipes ?? []);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 401
        ) {
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }

        setError('Recipes could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadRecipes();
  }, [navigate]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage, navigate, location.pathname]);

  async function handleDeleteRecipe(recipe: Recipe) {
    if (!window.confirm(`Delete "${recipe.title}"?`)) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      setDeletingRecipeId(recipe._id);
      setError('');

      await axios.delete(`${BACKEND_URL}/api/recipes/${recipe._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecipes((currentRecipes) =>
        currentRecipes.filter(
          (currentRecipe) => currentRecipe._id !== recipe._id,
        ),
      );
    } catch {
      setError('Recipe could not be deleted.');
    } finally {
      setDeletingRecipeId(null);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <button
          className="profile-button"
          type="button"
          aria-label="Profile"
          onClick={() => navigate('/profile')}
        >
          ◯
        </button>

        <button
            className="ai-assistant-button"
            type="button"
            onClick={() => navigate('/ai-assistant')}
            >
            AI Assistant
        </button>

        <p className="dashboard-intro">
          Welcome back! Manage your recipes or add a new one.
        </p>

        <h1>Your Recipes</h1>
      </header>

      <div className="search-bar-wrapper">
        <label className="search-bar" htmlFor="recipe-search">
          <svg
            className="search-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            id="recipe-search"
            type="search"
            value={searchTerm}
            placeholder="Search your recipes..."
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              className="clear-search-button"
              type="button"
              aria-label="Clear recipe search"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </label>
      </div>

      {successMessage && (
        <p className="dashboard-success" role="status">
          {successMessage}
        </p>
      )}

      {error && (
        <p className="dashboard-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <section className="empty-recipes-card">
          <p>Loading recipes...</p>
        </section>
      ) : recipes.length === 0 ? (
        <section className="empty-recipes-card">
          <p>Your recipes will show up here.</p>
        </section>
      ) : filteredRecipes.length === 0 ? (
        <section className="empty-recipes-card">
          <p>No recipes match your search.</p>
        </section>
      ) : (
        <section className="recipe-grid" aria-label="Your recipes">
          {filteredRecipes.map((recipe) => (
            <article className="recipe-card" key={recipe._id}>
              {recipe.image ? (
                <img
                  className="recipe-card-image"
                  src={recipe.image}
                  alt={recipe.title}
                />
              ) : (
                <div className="recipe-card-image recipe-image-placeholder">
                  No image
                </div>
              )}

              <div className="recipe-card-content">
                <h2>{recipe.title}</h2>

                <p className="recipe-created-date">
                  Created on {formatDate(recipe.createdAt)}
                </p>

                <div className="recipe-tags">
                  {recipe.tags?.map((tag) => (
                    <span className="recipe-tag" key={`${recipe._id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="recipe-card-actions">
                  <button
                    className="recipe-action-button delete-button"
                    type="button"
                    aria-label={`Delete ${recipe.title}`}
                    title="Delete recipe"
                    disabled={deletingRecipeId === recipe._id}
                    onClick={() => void handleDeleteRecipe(recipe)}
                  >
                    🗑
                  </button>

                  <button
                    className="recipe-action-button edit-button"
                    type="button"
                    aria-label={`Edit ${recipe.title}`}
                    title="Edit recipe"
                    onClick={() =>
                      navigate(`/create-recipe/${recipe._id}/edit`)
                    }
                  >
                    ✎
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <button
        className="create-recipe-button"
        type="button"
        onClick={() => navigate('/create-recipe')}
      >
        Create Recipe
      </button>
    </main>
  );
}
