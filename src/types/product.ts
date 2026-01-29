import { z } from "zod";
import { Culture } from "./enums";

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
    brandid: z.string().optional(),
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
                            ingredient: z
                                .union([
                                    IngredientSchema,
                                    z.array(IngredientSchema),
                                ])
                                .optional(),
                        })
                        .optional(),
                    allergenset: z
                        .object({
                            allergen: z
                                .union([
                                    AllergenSchema,
                                    z.array(AllergenSchema),
                                ])
                                .optional(),
                        })
                        .optional(),
                    nutrientset: z
                        .object({
                            nutrient: z
                                .union([
                                    NutrientSchema,
                                    z.array(NutrientSchema),
                                ])
                                .optional(),
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
                                                downloadurl: z
                                                    .string()
                                                    .optional(),
                                            })
                                            .optional(),
                                        highresolutionimage: z
                                            .object({
                                                downloadurl: z
                                                    .string()
                                                    .optional(),
                                            })
                                            .optional(),
                                    }),
                                    z.array(
                                        z.object({
                                            isheroimage: z.string().optional(),
                                            downloadurl: z.string().optional(),
                                            lowresolutionimage: z
                                                .object({
                                                    downloadurl: z
                                                        .string()
                                                        .optional(),
                                                })
                                                .optional(),
                                            highresolutionimage: z
                                                .object({
                                                    downloadurl: z
                                                        .string()
                                                        .optional(),
                                                })
                                                .optional(),
                                        }),
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

// SearchResult-specific schemas (option 1)

const SearchResultCharacteristicInfoSchema = z.object({
    id: z.string(),
    name: LocalizedStringSchema,
    description: LocalizedStringSchema.optional(),
    isapplicable: z.string().optional(),
    isclaimedonlabel: z.string().optional(),
});

const SearchResultAllergenInfoSchema = z.object({
    id: z.string(),
    name: LocalizedStringSchema,
    levelofcontainmentid: z.string().optional(),
    levelofcontainmentname: LocalizedStringSchema.optional(),
    sequence: z.string().optional(),
    translation: z.array(TranslationSchema).optional(),
});

const SearchResultNutrientInfoSchema = z.object({
    id: z.string().optional(),
    name: LocalizedStringSchema.optional(),
    measurementprecisionid: z.string().optional(),
    measurementprecisionname: LocalizedStringSchema.optional(),
    value: z.number().optional(),
    valueperserving: z.number().optional(),
    decimalvalue: z.string().optional(),
    decimalvalueperserving: z.string().optional(),
    guidelinedailyamount: z.number().optional(),
    unitofmeasureid: z.string().optional(),
    unitofmeasurename: LocalizedStringSchema.optional(),
});

const SearchResultIngredientInfoSchema = z.object({
    sequence: z.string().optional(),
    id: z.string(),
    name: LocalizedStringSchema,
    countryoforigins: z
        .object({
            countryoforigin: z.object({
                id: z.string(),
                name: LocalizedStringSchema,
                sequence: z.string().optional(),
                translation: z.array(TranslationSchema).optional(),
            }),
        })
        .optional(),
});

export const SearchResultProductSchema = z.object({
    product: z.object({
        mongoDbId: z.string(),
        hasImpactScore: z.boolean().optional(),
        summary: ProductSummarySchema.extend({
            netweight: z.number().optional(),
            netweightunitofmeasure: LocalizedStringSchema.optional(),
            netcontent: z.number().optional(),
            netcontentunitofmeasure: LocalizedStringSchema.optional(),
            targetmarketid: z.string().optional(),
            targetmarketisocode: z.string().optional(),
        }),
        productinfolist: z
            .object({
                productinfo: z.object({
                    id: z.string(),
                    name: LocalizedStringSchema,
                    targetmarketid: z.string().optional(),
                    targetmarketname: LocalizedStringSchema.optional(),
                    targetmarketisocode: z.string().optional(),
                    productgroupid: z.string().optional(),
                    productgroupname: LocalizedStringSchema.optional(),
                    overalproductgroupid: z.string().optional(),
                    overalproductgroupname: LocalizedStringSchema.optional(),
                    productcategoryid: z.string().optional(),
                    productcategoryname: LocalizedStringSchema.optional(),
                    isnonfood: z.string().optional(),
                    lastupdatedon: z.string().optional(),
                    characteristicinfolist: z
                        .object({
                            characteristicinfo: z.array(
                                SearchResultCharacteristicInfoSchema,
                            ),
                        })
                        .optional(),
                }),
            })
            .optional(),
        specificationinfolist: z
            .object({
                specificationinfo: z.object({
                    id: z.string(),
                    ingredientset: z
                        .object({
                            ingredientcomment: LocalizedStringSchema.optional(),
                            ingredientdeclaration:
                                LocalizedStringSchema.optional(),
                            ingredientdeclarationpreview:
                                LocalizedStringSchema.optional(),
                            ingredients: z
                                .object({
                                    ingredientinfo: z.array(
                                        SearchResultIngredientInfoSchema,
                                    ),
                                })
                                .optional(),
                        })
                        .optional(),
                    allergenset: z
                        .object({
                            allergens: z.object({
                                allergeninfo: z.array(
                                    SearchResultAllergenInfoSchema,
                                ),
                            }),
                        })
                        .optional(),
                    nutrientset: z
                        .object({
                            nutrientcomment: LocalizedStringSchema.optional(),
                            nutrientinfolist: z.object({
                                nutrientinfo: z.array(
                                    SearchResultNutrientInfoSchema,
                                ),
                            }),
                        })
                        .optional(),
                }),
            })
            .optional(),
        commercialinfolist: z
            .object({
                commercialinfo: z.object({
                    id: z.string(),
                    name: LocalizedStringSchema,
                    legalname: LocalizedStringSchema.optional(),
                    functionalname: LocalizedStringSchema.optional(),
                    variantdescription: LocalizedStringSchema.optional(),
                    description: LocalizedStringSchema.optional(),
                    brand: z
                        .object({
                            id: z.string().optional(),
                            name: z.string().optional(),
                            isprivatelabel: z.string().optional(),
                            brandownerid: z.string().optional(),
                            brandownername: z.string().optional(),
                            brandownergln: z.string().optional(),
                            image: z.string().optional(),
                        })
                        .optional(),
                }),
            })
            .optional(),
        logisticinfolist: z
            .object({
                logisticinfo: z.object({
                    id: z.string(),
                    name: LocalizedStringSchema,
                    gtin: z.string().optional(),
                    number: z.string().optional(),
                    taxrateid: z.string().optional(),
                    taxratename: LocalizedStringSchema.optional(),
                    isbaseunit: z.string().optional(),
                    isavailableinretail: z.string().optional(),
                    isavailableinfoodservice: z.string().optional(),
                    isconsumerunit: z.string().optional(),
                    isdespatchunit: z.string().optional(),
                    isinvoiceunit: z.string().optional(),
                    isorderableunit: z.string().optional(),
                    isvariableunit: z.string().optional(),
                    netweightvalue: z.number().optional(),
                    netweightuomname: LocalizedStringSchema.optional(),
                    netcontentvalue: z.number().optional(),
                    netcontentuomname: LocalizedStringSchema.optional(),
                    grossweightvalue: z.number().optional(),
                    grossweightuomname: LocalizedStringSchema.optional(),
                    drainedweightvalue: z.number().optional(),
                    drainedweightuomname: LocalizedStringSchema.optional(),
                    numberofservingsperpackage: z.number().optional(),
                    impactscoreinfo: z
                        .object({
                            psimpactscore: z.string().optional(),
                            farmtofarmgatecarbonfootprint: z
                                .string()
                                .optional(),
                            cradletomanufacturingcarbonfootprint: z
                                .string()
                                .optional(),
                            cradletogravecarbonfootprint: z.string().optional(),
                            waterusage: z.string().optional(),
                            dataquality: z.string().optional(),
                        })
                        .optional(),
                    assetinfolist: z
                        .object({
                            assetinfo: z
                                .object({
                                    id: z.string().optional(),
                                    typeid: z.string().optional(),
                                    typename: LocalizedStringSchema.optional(),
                                    downloadurl: z.string().optional(),
                                    isdefault: z.string().optional(),
                                    isheroimage: z.string().optional(),
                                    lowresolutionimage: z
                                        .object({
                                            downloadurl: z.string().optional(),
                                        })
                                        .optional(),
                                })
                                .optional(),
                        })
                        .optional(),
                }),
            })
            .optional(),
    }),
});

export type SearchResultProduct = z.infer<typeof SearchResultProductSchema>;
