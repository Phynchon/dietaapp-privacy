import { useEffect, useRef } from "react";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      !element.getAttribute("aria-hidden") &&
      element.tabIndex !== -1,
  );
}

function ImcModal({
  isOpen,
  uiText,
  showChallengePrompt,
  imcSex,
  onSexChange,
  imcWeight,
  onWeightChange,
  imcHeight,
  onHeightChange,
  imcValue,
  imcCategory,
  imcRecommendation,
  onClose,
  onGoRecommended,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const focusable = getFocusableElements(modalRef.current);
    focusable[0]?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const nodes = getFocusableElements(modalRef.current);
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActive instanceof HTMLElement) {
        previousActive.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="imc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={uiText.imcCalculator}
      onClick={onClose}
    >
      <section
        ref={modalRef}
        className="imc-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {showChallengePrompt ? (
          <div className="imc-challenge-popup" role="status" aria-live="polite">
            <p className="imc-challenge-lead">{uiText.imcChallengeLead}</p>
            <p className="imc-challenge-body">{uiText.imcChallengeBody}</p>
          </div>
        ) : null}

        <h3>{uiText.imcCalculator}</h3>

        <label className="imc-field" htmlFor="imc-sex">
          {uiText.sex}
          <select
            id="imc-sex"
            value={imcSex}
            onChange={(event) => onSexChange(event.target.value)}
          >
            <option value="female">{uiText.womanOpt}</option>
            <option value="male">{uiText.manOpt}</option>
          </select>
        </label>

        <label className="imc-field" htmlFor="imc-weight">
          {uiText.weightKg}
          <input
            id="imc-weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="1"
            value={imcWeight}
            onChange={(event) => onWeightChange(event.target.value)}
          />
        </label>

        <label className="imc-field" htmlFor="imc-height">
          {uiText.heightM}
          <input
            id="imc-height"
            type="number"
            inputMode="numeric"
            step="1"
            min="80"
            max="250"
            value={imcHeight}
            onChange={(event) => onHeightChange(event.target.value)}
          />
        </label>

        <p className="imc-result">
          {uiText.imcLabel}:{" "}
          <strong>{imcValue == null ? "--" : imcValue.toFixed(2)}</strong>
        </p>
        <p className="imc-result">
          {uiText.classification}: <strong>{imcCategory || "--"}</strong>
        </p>
        <p className="imc-result">
          {uiText.recommendation}:{" "}
          <strong>
            {imcRecommendation == null ? "--" : `${imcRecommendation} kcal`}
          </strong>
        </p>

        {imcRecommendation != null ? (
          <button className="menu-nav-button imc-go-diet" onClick={onGoRecommended}>
            {uiText.goRecommended}
          </button>
        ) : null}

        <button className="menu-nav-button imc-close" onClick={onClose}>
          {uiText.close}
        </button>
      </section>
    </div>
  );
}

export default ImcModal;
