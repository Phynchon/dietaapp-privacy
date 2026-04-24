import { useEffect, useRef } from "react";
import { useMemo, useState } from "react";

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
  initialFlowStep = "calc",
  directRecommendation = null,
  uiText,
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
  onConfirmStart,
}) {
  const modalRef = useRef(null);
  const [flowStep, setFlowStep] = useState("calc");
  const [startOffsetDays, setStartOffsetDays] = useState(2);
  const [trackingAlias, setTrackingAlias] = useState("");
  const [trackingCountry, setTrackingCountry] = useState("");
  const [trackingAge, setTrackingAge] = useState("");

  const dayOffsets = useMemo(
    () => Array.from({ length: 6 }, (_, index) => index + 2),
    [],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    setFlowStep(initialFlowStep);
    setStartOffsetDays(2);
    setTrackingAlias("");
    setTrackingCountry("");
    setTrackingAge("");

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
  }, [initialFlowStep, isOpen, onClose]);

  if (!isOpen) return null;

  const activeRecommendation = directRecommendation ?? imcRecommendation;

  const handleStartConfirmation = (offsetDays) => {
    if (activeRecommendation == null) return;
    const normalizedHeight = Number(String(imcHeight).replace(",", "."));
    const normalizedWeight = Number(String(imcWeight).replace(",", "."));
    const normalizedAge = Number(String(trackingAge).replace(",", "."));
    const alias = trackingAlias.trim();
    const country = trackingCountry.trim();
    const age = Number.isFinite(normalizedAge) && normalizedAge > 0 ? normalizedAge : null;
    const hasOptionalData = Boolean(alias || country || age != null);

    onConfirmStart?.({
      calories: activeRecommendation,
      offsetDays,
      profile: hasOptionalData
        ? {
            alias,
            country,
            age,
            gender: imcSex,
            heightCm: Number.isFinite(normalizedHeight) && normalizedHeight > 0 ? normalizedHeight : null,
            weightKg: Number.isFinite(normalizedWeight) && normalizedWeight > 0 ? normalizedWeight : null,
            imc: imcValue ?? null,
          }
        : null,
    });

    if (Number(offsetDays) === 0) {
      onGoRecommended?.(activeRecommendation);
      onClose();
      return;
    }

    setFlowStep("done");
  };

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
        {flowStep === "calc" ? (
          <>
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
                {activeRecommendation == null ? "--" : `${activeRecommendation} kcal`}
              </strong>
            </p>

            {activeRecommendation != null ? (
              <button
                className="menu-nav-button imc-go-diet"
                onClick={() => setFlowStep("commit")}
              >
                {uiText.goRecommended}
              </button>
            ) : null}

            <button className="menu-nav-button imc-close" onClick={onClose}>
              {uiText.close}
            </button>
          </>
        ) : null}

        {flowStep === "commit" ? (
          <div className="imc-flow-block imc-flow-block-commit">
            <h3>{uiText.imcCommitTitle}</h3>
            <p className="imc-flow-message">{uiText.imcChallengeBody}</p>
            <p className="imc-commit-text">{uiText.imcCommitBody}</p>
            <p className="imc-commit-text">{uiText.imcCommitExtended}</p>
            <p className="imc-flow-message">{uiText.imcCommitTrackingLead}</p>
            <label className="imc-field" htmlFor="imc-tracking-alias">
              {uiText.imcCommitTrackingAliasLabel}
              <input
                id="imc-tracking-alias"
                type="text"
                value={trackingAlias}
                onChange={(event) => setTrackingAlias(event.target.value)}
                placeholder={uiText.imcCommitTrackingAliasPlaceholder}
              />
            </label>
            <label className="imc-field" htmlFor="imc-tracking-country">
              {uiText.imcCommitTrackingCountryLabel}
              <input
                id="imc-tracking-country"
                type="text"
                value={trackingCountry}
                onChange={(event) => setTrackingCountry(event.target.value)}
                placeholder={uiText.imcCommitTrackingCountryPlaceholder}
              />
            </label>
            <label className="imc-field" htmlFor="imc-tracking-age">
              {uiText.imcCommitTrackingAgeLabel}
              <input
                id="imc-tracking-age"
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                value={trackingAge}
                onChange={(event) => setTrackingAge(event.target.value)}
                placeholder={uiText.imcCommitTrackingAgePlaceholder}
              />
            </label>
            <p className="imc-flow-message imc-flow-strong">{uiText.imcCommitFollowUp}</p>
            <button className="menu-nav-button" onClick={() => setFlowStep("start")}> 
              {uiText.imcCommitYes}
            </button>
          </div>
        ) : null}

        {flowStep === "start" ? (
          <div className="imc-flow-block">
            <h3>{uiText.imcStartTitle}</h3>
            <button
              className="menu-nav-button"
              onClick={() => handleStartConfirmation(0)}
            >
              {uiText.imcStartToday}
            </button>
            <label className="imc-field" htmlFor="imc-start-offset">
              {uiText.imcStartOffsetLabel}
              <select
                id="imc-start-offset"
                value={startOffsetDays}
                onChange={(event) => setStartOffsetDays(Number(event.target.value))}
              >
                {dayOffsets.map((offsetDay) => (
                  <option key={offsetDay} value={offsetDay}>
                    {offsetDay === 2 ? uiText.imcStartOffsetOptionBase : `+${offsetDay} dias`}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="menu-nav-button"
              onClick={() => handleStartConfirmation(startOffsetDays)}
            >
              {uiText.imcStartConfirm}
            </button>
          </div>
        ) : null}

        {flowStep === "done" ? (
          <div className="imc-flow-block">
            <p className="imc-flow-message">{uiText.imcStartSaved}</p>
            <button
              className="menu-nav-button"
              onClick={() => {
                onGoRecommended?.(activeRecommendation);
                onClose();
              }}
            >
              {uiText.close}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default ImcModal;
