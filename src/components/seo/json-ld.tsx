import React from "react";

export const JsonLd = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kaslo",
    "url": "https://kaslo.nanasgunung.com",
    "logo": "https://kaslo.nanasgunung.com/logolight.svg",
    "sameAs": [
      "https://github.com/nasgunawann/next-money-manager",
      "https://nanasgunung.com"
    ]
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kaslo",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    },
    "description": "Aplikasi manajemen keuangan pribadi untuk mencatat transaksi dan pengendalian anggaran harian secara aman dan mudah.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
    </>
  );
};
