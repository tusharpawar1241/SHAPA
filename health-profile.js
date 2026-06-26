document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const form = document.getElementById('health-profile-form');
  const saveBtn = document.getElementById('save-btn');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnText = document.getElementById('btn-text');
  const resetBtn = document.getElementById('reset-btn');
  
  // Progress Elements
  const circleBar = document.getElementById('circle-bar');
  const percentageLabel = document.getElementById('percentage-label');
  const progressText = document.getElementById('progress-percentage-text');
  const horizontalBar = document.getElementById('horizontal-progress-bar');
  
  // Summary Elements
  const summaryGoals = document.getElementById('summary-goals');
  const summaryDiet = document.getElementById('summary-diet');
  const summaryConditions = document.getElementById('summary-conditions');
  const summarySkin = document.getElementById('summary-skin');

  // SVG Circle Stroke calculation
  const circleRadius = 34;
  const circumference = 2 * Math.PI * circleRadius; // ~213.6

  /* ==========================================
     Mutual Exclusion Logic
     ========================================== */
  const setupMutualExclusion = (selectorName) => {
    const checkboxes = document.querySelectorAll(`input[name="${selectorName}"]`);
    const noneTrigger = document.querySelector(`input[name="${selectorName}"].none-trigger`);

    if (!noneTrigger) return;

    checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.classList.contains('none-trigger')) {
          if (e.target.checked) {
            // Uncheck all other checkboxes in the group
            checkboxes.forEach(other => {
              if (other !== e.target) other.checked = false;
            });
          }
        } else {
          if (e.target.checked) {
            // Uncheck the "None" trigger
            noneTrigger.checked = false;
          }
        }
        updateFormStatus();
      });
    });
  };

  // Setup exclusions for relevant fields
  setupMutualExclusion('conditions');
  setupMutualExclusion('foodAllergies');
  setupMutualExclusion('skinConcerns');
  setupMutualExclusion('cosmeticAllergies');
  setupMutualExclusion('hairConcerns');

  // Helper to get checked values labels or display fallback
  const getCheckedLabels = (name, selector = 'input[name="$$"]:checked') => {
    const query = selector.replace('$$', name);
    const elements = document.querySelectorAll(query);
    if (elements.length === 0) return '';
    return Array.from(elements).map(el => {
      const parent = el.closest('label');
      if (parent) {
        const textSpan = parent.querySelector('.card-label, .chip-label');
        return textSpan ? textSpan.textContent.trim() : el.value;
      }
      return el.value;
    }).join(', ');
  };

  /* ==========================================
     Dynamic Progress & Summary Calculation
     ========================================== */
  const updateFormStatus = () => {
    let score = 0;

    // 1. Personal Information (10% max)
    const nameVal = document.getElementById('full-name').value.trim();
    const ageVal = document.getElementById('age').value;
    const genderVal = document.getElementById('gender').value;
    const heightVal = document.getElementById('height').value;
    const weightVal = document.getElementById('weight').value;
    
    let personalFieldsFilled = 0;
    if (nameVal) personalFieldsFilled++;
    if (ageVal) personalFieldsFilled++;
    if (genderVal) personalFieldsFilled++;
    if (heightVal) personalFieldsFilled++;
    if (weightVal) personalFieldsFilled++;
    score += (personalFieldsFilled / 5) * 10;

    // 2. Medical Conditions (10% max)
    const conditionsChecked = document.querySelectorAll('input[name="conditions"]:checked').length;
    if (conditionsChecked > 0) score += 10;

    // 3. Food Allergies (10% max)
    const foodAllergiesChecked = document.querySelectorAll('input[name="foodAllergies"]:checked').length;
    if (foodAllergiesChecked > 0) score += 10;

    // 4. Dietary Preference (10% max)
    const dietarySelected = document.querySelector('input[name="dietaryPreference"]:checked');
    if (dietarySelected) score += 10;

    // 5. Lifestyle (10% max)
    const smokingVal = document.getElementById('smoking').value;
    const alcoholVal = document.getElementById('alcohol').value;
    const exerciseVal = document.getElementById('exercise').value;
    const waterVal = document.getElementById('water-intake').value;
    let lifestyleFieldsFilled = 0;
    if (smokingVal) lifestyleFieldsFilled++;
    if (alcoholVal) lifestyleFieldsFilled++;
    if (exerciseVal) lifestyleFieldsFilled++;
    if (waterVal) lifestyleFieldsFilled++;
    score += (lifestyleFieldsFilled / 4) * 10;

    // 6. Skin Profile (10% max)
    const skinTypeSelected = document.querySelector('input[name="skinType"]:checked');
    const skinToneVal = document.getElementById('skin-tone').value;
    const skinConcernsChecked = document.querySelectorAll('input[name="skinConcerns"]:checked').length;
    
    let skinScore = 0;
    if (skinTypeSelected) skinScore += 4;
    if (skinToneVal) skinScore += 4;
    if (skinConcernsChecked > 0) skinScore += 2;
    score += skinScore;

    // 7. Cosmetic Allergies (10% max)
    const cosmeticChecked = document.querySelectorAll('input[name="cosmeticAllergies"]:checked').length;
    if (cosmeticChecked > 0) score += 10;

    // 8. Hair Profile (10% max)
    const hairTypeSelected = document.querySelector('input[name="hairType"]:checked');
    const hairConcernsChecked = document.querySelectorAll('input[name="hairConcerns"]:checked').length;
    let hairScore = 0;
    if (hairTypeSelected) hairScore += 6;
    if (hairConcernsChecked > 0) hairScore += 4;
    score += hairScore;

    // 9. Goals (10% max)
    const goalsChecked = document.querySelectorAll('input[name="goals"]:checked').length;
    if (goalsChecked > 0) score += 10;

    // 10. Notifications (10% max)
    // Toggles logic (checks if any notification settings have been touched / set to checked/unchecked)
    // For simplicity, if at least one toggle is selected, give 10%
    const togglesCount = document.querySelectorAll('input[name^="notify"]:checked').length;
    if (togglesCount > 0) score += 10;

    // Format & Round
    const totalPercentage = Math.min(Math.round(score), 100);

    // Update Progress Indicators
    percentageLabel.textContent = `${totalPercentage}%`;
    progressText.textContent = `${totalPercentage}% Done`;
    horizontalBar.style.width = `${totalPercentage}%`;

    // Circular Progress stroke-dashoffset transition
    const offset = circumference - (totalPercentage / 100) * circumference;
    circleBar.style.strokeDashoffset = offset;

    // Update Sidebar summaries
    // Core Diet
    if (dietarySelected) {
      const dietLabel = dietarySelected.closest('label').querySelector('.radio-label').textContent.trim();
      summaryDiet.textContent = dietLabel;
    } else {
      summaryDiet.textContent = 'Not specified';
    }

    // Conditions
    const conditionsList = getCheckedLabels('conditions');
    summaryConditions.textContent = conditionsList ? conditionsList : 'None';

    // Skin type
    if (skinTypeSelected) {
      const typeLabel = skinTypeSelected.closest('label').querySelector('.card-label').textContent.trim();
      summarySkin.textContent = typeLabel;
    } else {
      summarySkin.textContent = 'Not specified';
    }

    // Goals
    const goalsList = getCheckedLabels('goals');
    summaryGoals.textContent = goalsList ? goalsList : 'None selected';
  };

  // Add listeners to elements for live calculations
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', updateFormStatus);
    el.addEventListener('input', updateFormStatus);
  });

  /* ==========================================
     Toast Notification System
     ========================================== */
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'check_circle';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon ${type === 'success' ? 'color-green' : 'color-red'}">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after animation completes
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  /* ==========================================
     Form Validation & Submission
     ========================================== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset validation states
    form.querySelectorAll('.form-input, .form-select').forEach(el => {
      el.classList.remove('invalid');
    });

    // Validate section 1 elements manually to display errors cleanly
    const requiredInputs = form.querySelectorAll('[required]');
    let hasError = false;

    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('invalid');
        hasError = true;
      }
    });

    if (hasError) {
      showToast('Please fill in all required personal information fields.', 'error');
      // Scroll to Section 1
      const personalSection = document.querySelector('[data-section="personal"]');
      if (personalSection) {
        personalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Disable button, show loading spinner
    saveBtn.disabled = true;
    btnSpinner.classList.remove('hidden');
    btnText.textContent = 'Saving Profile...';

    // Simulate async Firestore save
    setTimeout(() => {
      saveBtn.disabled = false;
      btnSpinner.classList.add('hidden');
      btnText.textContent = 'Save Health Profile';

      showToast('Health Profile successfully updated and synced with Guardian AI!', 'success');
    }, 1500);
  });

  /* ==========================================
     Reset Form state
     ========================================== */
  resetBtn.addEventListener('click', () => {
    form.reset();
    
    // Clear validation classes
    form.querySelectorAll('.form-input, .form-select').forEach(el => {
      el.classList.remove('invalid');
    });

    // Update calculations to initial
    updateFormStatus();

    showToast('Form fields cleared.', 'success');
  });

  // Initial Calculation on load
  updateFormStatus();
});
