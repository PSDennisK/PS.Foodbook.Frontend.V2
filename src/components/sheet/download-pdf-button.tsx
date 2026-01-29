'use client';
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildProductSheetUrl, getLocalizedPath } from "@/lib/utils/url";
import type { Culture } from "@/types/enums";

interface DownloadPdfButtonProps {
    productId: string;
    productName: string;
    locale: Culture;
}

export function DownloadPdfButton({
    productId,
    productName,
    locale,
}: DownloadPdfButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);

        try {
            const sheetPath = buildProductSheetUrl(productId, productName);
            const pdfPath = `${sheetPath}/pdf`;
            const localizedPdfUrl = getLocalizedPath(locale, pdfPath);

            // Open PDF in new window/tab
            window.open(localizedPdfUrl, "_blank");
        } catch (error) {
            console.error("Failed to download PDF:", error);
        } finally {
            // Reset loading state after a short delay
            setTimeout(() => setIsLoading(false), 1000);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Download className="w-4 h-4 mr-2" />
            )}
            PDF
        </Button>
    );
}