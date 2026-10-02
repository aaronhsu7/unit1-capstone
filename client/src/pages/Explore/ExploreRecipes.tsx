import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Explore.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type PublicRecipe = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  tags?: string[];
  createdAt?: string;
};

type PublicRecipeResponse =
  | PublicRecipe[]
  | { recipes?: PublicRecipe[] };

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

export default function ExploreRecipes() {
  const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

    useEffect(() => {
    async function loadPublicRecipes() {
        try {
        const { data } = await axios.get<PublicRecipeResponse>(
            `${BACKEND_URL}/api/recipes`,
        );

        setRecipes(Array.isArray(data) ? data : data.recipes ?? []);
        } catch {
        setError('Recipes could not be loaded.');
        } finally {
        setIsLoading(false);
        }
    }

    void loadPublicRecipes();
    }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => {
    if (!normalizedSearch) return true;

    const searchableText = [
      recipe.title,
      recipe.description,
      ...(recipe.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  return (
    <main className="explore-page">
      <header className="explore-header">
        <Link className="explore-logo" to="/login">
          spoonful
        </Link>

        <div className="explore-heading-row">
          <div>
            <p className="explore-intro">
              Browse recipes without logging in.
            </p>
            <h1>Explore Recipes</h1>
          </div>

          <Link className="explore-login-link" to="/login">
            Log in
          </Link>
        </div>
      </header>

      <label className="explore-search" htmlFor="public-recipe-search">
        <span aria-hidden="true">⌕</span>
        <input
          id="public-recipe-search"
          type="search"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </label>

      {error && (
        <p className="explore-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="explore-status">Loading recipes...</p>
      ) : filteredRecipes.length === 0 ? (
        <p className="explore-status">
          {recipes.length === 0
            ? 'No public recipes are available yet.'
            : 'No recipes match your search.'}
        </p>
      ) : (
        <section className="explore-grid" aria-label="Public recipes">
          {filteredRecipes.map((recipe) => (
            <article className="explore-card" key={recipe._id}>
              {recipe.image ? (
                <img
                  className="explore-card-image"
                  src={recipe.image}
                  alt={recipe.title}
                />
              ) : (
                <div className="explore-card-image explore-image-placeholder">
                  No image
                </div>
              )}

              <div className="explore-card-content">
                <h2>{recipe.title}</h2>

                {recipe.description && (
                  <p className="explore-description">
                    {recipe.description}
                  </p>
                )}

                <p className="explore-created-date">
                  Created on {formatDate(recipe.createdAt)}
                </p>

                <div className="explore-tags">
                  {recipe.tags?.map((tag) => (
                    <span className="explore-tag" key={`${recipe._id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  className="view-recipe-button"
                  to={`/explore/${recipe._id}`}
                >
                  View Recipe
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
