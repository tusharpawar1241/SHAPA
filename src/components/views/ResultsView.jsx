import FoodResultPage from '../results/FoodResultPage';
import MedicineResultPage from '../results/MedicineResultPage';
import CosmeticResultPage from '../results/CosmeticResultPage';

export default function ResultsView({ resultsData, activeCategory, switchView, userProfile, apiSettings }) {
  if (!resultsData) return null;

  if (activeCategory === 'food') {
    return (
      <FoodResultPage
        resultsData={resultsData}
        switchView={switchView}
        userProfile={userProfile}
        apiSettings={apiSettings}
      />
    );
  }

  if (activeCategory === 'medicine') {
    return (
      <MedicineResultPage
        resultsData={resultsData}
        switchView={switchView}
        userProfile={userProfile}
        apiSettings={apiSettings}
      />
    );
  }

  // Default: cosmetics
  return (
    <CosmeticResultPage
      resultsData={resultsData}
      switchView={switchView}
      userProfile={userProfile}
      apiSettings={apiSettings}
    />
  );
}
