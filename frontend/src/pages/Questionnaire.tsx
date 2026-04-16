// Matthew Li
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, submitQuestionnaire } from '../api/events';
import type { Category } from '../types';

export function Questionnaire() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedInterests.length === 0) {
      setError('Please select at least one area of interest');
      return;
    }

    setIsLoading(true);

    try {
      await submitQuestionnaire({
        areas_of_interest: selectedInterests,
        phone_number: phoneNumber,
        age: age ?? null,
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-card">
        <h1>Tell Us About Yourself</h1>
        <p className="questionnaire-subtitle">
          Select the areas where you'd like to volunteer. We'll match you with opportunities that fit your interests.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Areas of Interest *</label>
            <div className="interest-grid">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  className={`interest-btn ${selectedInterests.includes(category.key) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (optional)</label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age (optional)</label>
            <input
              type="number"
              id="age"
              value={age ?? ''}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Your age"
              min={0}
              max={120}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Find Opportunities'}
          </button>
        </form>
      </div>
    </div>
  );
}
