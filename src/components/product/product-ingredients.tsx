import { Card } from '@/components/ui/card';
import { normalizeToArray } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';

interface ProductIngredientsProps {
  product: Product;
  locale: Culture;
}

export function ProductIngredients({ product, locale }: ProductIngredientsProps) {
  const ingredientData =
    product.product.specificationinfolist?.specificationinfo?.ingredientset?.ingredient;

  if (!ingredientData) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Geen ingrediënten beschikbaar</p>
      </Card>
    );
  }

  const ingredients = normalizeToArray(ingredientData);

  // Sort by order if available
  const sortedIngredients = [...ingredients].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ingrediënten</h3>
          <p className="text-sm text-muted-foreground">
            Lijst van ingrediënten in aflopende volgorde van gewicht
          </p>
        </div>

        {/* Ingredients as a formatted list */}
        <div className="prose prose-sm max-w-none">
          <p className="leading-relaxed">
            {sortedIngredients.map((ingredient, index) => {
              const name = getTranslation(ingredient.name, locale);
              const percentage = ingredient.percentage;
              const isLast = index === sortedIngredients.length - 1;
              const ingredientKey = `${name}-${ingredient.order ?? index}-${percentage ?? ''}`;

              return (
                <span key={ingredientKey}>
                  <span className="font-medium">{name}</span>
                  {percentage && <span className="text-muted-foreground"> ({percentage}%)</span>}
                  {!isLast && ', '}
                </span>
              );
            })}
            .
          </p>
        </div>

        {/* Ingredients as a table (alternative view) */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 text-sm">Gedetailleerd overzicht</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">#</th>
                  <th className="text-left py-2 px-3 font-medium">Ingrediënt</th>
                  <th className="text-right py-2 px-3 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {sortedIngredients.map((ingredient, index) => {
                  const name = getTranslation(ingredient.name, locale);
                  const isEven = index % 2 === 0;
                  const ingredientKey = `${name}-${ingredient.order ?? index}-${ingredient.percentage ?? ''}`;

                  return (
                    <tr
                      key={ingredientKey}
                      className={`border-b last:border-b-0 ${isEven ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <td className="py-2 px-3 text-muted-foreground">
                        {ingredient.order ?? index + 1}
                      </td>
                      <td className="py-2 px-3">{name}</td>
                      <td className="text-right py-2 px-3 font-mono">
                        {ingredient.percentage ? `${ingredient.percentage}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
