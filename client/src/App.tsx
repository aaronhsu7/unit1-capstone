// filename: src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateRecipe from './pages/CreateRecipe/CreateRecipe';
import ProtectedRoute from './components/ProtectedRoute';
import ExploreRecipes from './pages/Explore/ExploreRecipes';
import AIAssistant from './pages/AIAssistant/AIAssistant';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
      <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes/new" element={<CreateRecipe />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/create-recipe/:id/edit" element={<CreateRecipe />} />
      </Route>
      <Route path="/explore" element={<ExploreRecipes />} />
      <Route path="/explore/:id" element={<ExploreRecipes />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
    </Routes>
  );
}

export default App;
