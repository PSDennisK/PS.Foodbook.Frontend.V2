import { z } from 'zod';
import { Culture } from './enums';

export const TranslationSchema = z.object({
  value: z.string(),
  culture: z.nativeEnum(Culture),
});

export const LocalizedStringSchema = z.object({
  value: z.string(),
  translation: z.array(TranslationSchema).optional(),
});

export const ProductSummarySchema = z.object({
  id: z.string(),
  mongoDbId: z.string().optional(),
  name: LocalizedStringSchema,
  ean: z.string(),
  brandname: z.string(),
  packshot: z.string().optional(),
  publiclyvisible: z.string(),
  lastupdatedon: z.coerce.date(),
});

export const AllergenSchema = z.object({
  name: LocalizedStringSchema,
  levelcode: z.string(),
  allergentype: z.string().optional(),
});

export const NutrientSchema = z.object({
  name: LocalizedStringSchema,
  value: z.string(),
  unit: z.string(),
  quantitytypecode: z.string().optional(),
});

export const IngredientSchema = z.object({
  name: LocalizedStringSchema,
  percentage: z.string().optional(),
  order: z.number().optional(),
});

export const ProductSchema = z.object({
  product: z.object({
    mongoDbId: z.string(),
    hasImpactScore: z.boolean().optional(),
    summary: ProductSummarySchema,
    productinfolist: z
      .object({
        productinfo: z.object({
          qualitymarkinfolist: z.any().optional(),
          fishingredientinfolist: z.any().optional(),
          characteristicinfolist: z.any().optional(),
        }),
      })
      .optional(),
    specificationinfolist: z
      .object({
        specificationinfo: z.object({
          ingredientset: z
            .object({
              ingredient: z.union([IngredientSchema, z.array(IngredientSchema)]).optional(),
            })
            .optional(),
          allergenset: z
            .object({
              allergen: z.union([AllergenSchema, z.array(AllergenSchema)]).optional(),
            })
            .optional(),
          nutrientset: z
            .object({
              nutrient: z.union([NutrientSchema, z.array(NutrientSchema)]).optional(),
            })
            .optional(),
        }),
      })
      .optional(),
    logisticinfolist: z
      .object({
        logisticinfo: z.object({
          assetinfolist: z
            .object({
              assetinfo: z
                .union([
                  z.object({
                    isheroimage: z.string().optional(),
                    downloadurl: z.string().optional(),
                    lowresolutionimage: z
                      .object({
                        downloadurl: z.string().optional(),
                      })
                      .optional(),
                    highresolutionimage: z
                      .object({
                        downloadurl: z.string().optional(),
                      })
                      .optional(),
                  }),
                  z.array(
                    z.object({
                      isheroimage: z.string().optional(),
                      downloadurl: z.string().optional(),
                      lowresolutionimage: z
                        .object({
                          downloadurl: z.string().optional(),
                        })
                        .optional(),
                      highresolutionimage: z
                        .object({
                          downloadurl: z.string().optional(),
                        })
                        .optional(),
                    })
                  ),
                ])
                .optional(),
            })
            .optional(),
        }),
      })
      .optional(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductSummary = z.infer<typeof ProductSummarySchema>;
export type Allergen = z.infer<typeof AllergenSchema>;
export type Nutrient = z.infer<typeof NutrientSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
