function MealCardsGrid({ mealOrder, menuByMeal, locale, formatMenuItem }) {
  const optionTotalMeals = ["breakfast", "midmorning", "snack"];

  return (
    <div className="menu-grid">
      {mealOrder.map((meal) => {
        const data = menuByMeal[meal.key];
        const hasOptionTotals = optionTotalMeals.includes(meal.key);
        return (
          <article key={meal.key} className="menu-card">
            <div className="menu-card-header">
              <h3>{meal.label}</h3>
              <span className="menu-tag">{meal.time}</span>
            </div>
            <p className="menu-title">{data.title}</p>
            {data.items.length ? (
              <ul>
                {data.items.map((item, index) => {
                  const optionCalories = data.itemCalories?.[index];
                  return (
                    <li key={`${item}-${index}`}>
                      {formatMenuItem(item)}
                      {hasOptionTotals &&
                        typeof optionCalories === "number" && (
                          <p className="menu-total menu-total-inline">
                            <strong>
                              {locale.words.totalCaloriesLabel.replace(
                                "{calories}",
                                String(optionCalories),
                              )}
                            </strong>
                          </p>
                        )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{locale.words.noData}</p>
            )}
            {!hasOptionTotals && typeof data.totalCalories === "number" && (
              <p className="menu-total">
                <strong>
                  {locale.words.totalCaloriesLabel.replace(
                    "{calories}",
                    String(data.totalCalories),
                  )}
                </strong>
              </p>
            )}
            {(data.ingredients || data.recipe || data.notes?.length) && (
              <details>
                <summary>{locale.words.recipe}</summary>
                {data.ingredients && <p>{data.ingredients}</p>}
                {data.recipe && (
                  <p>
                    {locale.words.recipe}: {data.recipe}
                  </p>
                )}
                {data.notes?.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </details>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default MealCardsGrid;
