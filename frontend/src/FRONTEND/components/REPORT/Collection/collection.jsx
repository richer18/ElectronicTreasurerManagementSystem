import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import axiosInstance from "../../../../api/axiosInstance";

const months = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const years = [
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
];

const now = new Date();
const timestamp = now
  .toISOString() // 2025-08-22T12:34:56.789Z
  .replace(/[:\-T]/g, "") // replace : - T with _
  .replace(/\..+/, "");

// Convert any value into integer cents (ROUND instead of truncate)

// function toCents(value) {
//   if (value == null || value === "") return 0;

//   // Strip commas, $, spaces, etc.
//   const s = String(value)
//     .trim()
//     .replace(/[^0-9.-]/g, "");
//   if (!s) return 0;

//   const num = Number(s);
//   if (!Number.isFinite(num)) return 0;

//   return Math.round(num * 100);
// }

function toCents(value) {
  if (value == null || value === "") return 0;

  const s = String(value)
    .trim()
    .replace(/[^0-9.-]/g, "");
  if (!s) return 0;

  let num = Number(s);
  if (!Number.isFinite(num)) return 0;

  // ✅ normalize to 2 decimals before multiplying
  num = Number(num.toFixed(2));

  return Math.round(num * 100);
}

// Convert integer cents to formatted money string
function centsToMoney(cents) {
  if (!Number.isFinite(cents)) cents = 0;
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  return (
    sign +
    whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    "." +
    String(frac).padStart(2, "0")
  );
}

function Collection() {
  const [month, setMonth] = useState({ label: "January", value: "1" });
  const [year, setYear] = useState(() => {
    const currentYear = new Date().getFullYear().toString();
    return (
      years.find((option) => option.value === currentYear) || {
        label: "2025",
        value: "2025",
      }
    );
  });

  const getValue = (obj, key) => Number(obj?.[key]) || 0;

  const getShareValue = (obj, targetKey) => {
    if (!obj || typeof obj !== "object") return 0;

    const entry = Object.entries(obj).find(
      ([key]) => key.trim().toLowerCase() === targetKey.trim().toLowerCase()
    );

    return Number(entry?.[1]) || 0;
  };

  const [data, setData] = useState({
    manufacturing: 0,
    distributor: 0,
    retailing: 0,
    financial: 0,
    otherBusinessTax: 0,
    sandGravel: 0,
    finesPenalties: 0,
    mayorsPermit: 0,
    weighsMeasure: 0,
    tricycleOperators: 0,
    occupationTax: 0,
    certOfOwnership: 0,
    certOfTransfer: 0,
    cockpitProvShare: 0,
    cockpitLocalShare: 0,
    dockingMooringFee: 0,
    sultadas: 0,
    miscellaneousFee: 0,
    regOfBirth: 0,
    marriageFees: 0,
    burialFees: 0,
    correctionOfEntry: 0,
    fishingPermitFee: 0,
    saleOfAgriProd: 0,
    saleOfAcctForm: 0,
    waterFees: 0,
    stallFees: 0,
    cashTickets: 0,
    slaughterHouseFee: 0,
    rentalOfEquipment: 0,
    docStamp: 0,
    policeReportClearance: 0,
    secretaryfee: 0,
    medDentLabFees: 0,
    garbageFees: 0,
    cuttingTree: 0,
  });

  const [tfdata, setTFData] = useState({
    building_local_80: 0,
    building_trust_15: 0,
    building_national_5: 0,
    electricalfee: 0,
    zoningfee: 0,
    livestock_local_80: 0,
    livestock_national_20: 0,
    diving_local_40: 0,
    diving_brgy_30: 0,
    diving_fishers_30: 0,
  });

  const [cdata, setcData] = useState({
    TOTALAMOUNTPAID: 0,
  });

  // Memoize defaultFields to ensure it's stable across renders
  const defaultFields = useMemo(
    () => ({
      "Total Collections": 0,
      National: 0,
      "35% Prov’l Share": 0,
      "Provincial Special Ed Fund": 0,
      "Provincial General Fund": 0,
      "Municipal General Fund": 0,
      "Municipal Special Ed Fund": 0,
      "Municipal Trust Fund": 0,
      "Barangay Share": 0,
      Fisheries: 0,
    }),
    []
  ); // Empty dependency array ensures this object is created once

  // Define the unified state object
  const [sharingData, setSharingData] = useState({
    LandSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    sefLandSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    buildingSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
    sefBuildingSharingData: {
      Current: { ...defaultFields },
      Prior: { ...defaultFields },
      Penalties: { ...defaultFields },
      TOTAL: { ...defaultFields },
    },
  });

  useEffect(() => {
    const apiEndpoints = [
      { key: "LandSharingData", url: "LandSharingData" },
      { key: "sefLandSharingData", url: "sefLandSharingData" },
      { key: "buildingSharingData", url: "buildingSharingData" },
      { key: "sefBuildingSharingData", url: "sefBuildingSharingData" },
    ];

    const fetchAllData = async () => {
      try {
        const responses = await Promise.all(
          apiEndpoints.map((api) =>
            axiosInstance.get(api.url, {
              params: {
                month: month?.value || "",
                year: year?.value || "",
              },
            })
          )
        );

        const updatedSharingData = Object.fromEntries(
          apiEndpoints.map(({ key }) => [
            key,
            {
              Current: { ...defaultFields },
              Prior: { ...defaultFields },
              Penalties: { ...defaultFields },
              TOTAL: { ...defaultFields },
            },
          ])
        );

        responses.forEach((response, index) => {
          const apiKey = apiEndpoints[index].key;
          const data = response.data;

          if (!Array.isArray(data)) {
            console.error(
              `Invalid data format for ${apiKey}: Expected an array.`
            );
            return;
          }

          data.forEach((item) => {
            if (updatedSharingData[apiKey]?.[item.category]) {
              updatedSharingData[apiKey][item.category] = {
                ...defaultFields,
                ...item,
              };
            } else {
              console.warn(
                `Unexpected category: ${item.category} in ${apiKey}`
              );
            }
          });
        });

        setSharingData(updatedSharingData);
      } catch (err) {
        console.error("Error fetching sharing data:", err);
      }
    };

    fetchAllData();
  }, [month, year, defaultFields]); // ← Make sure to include month and year here

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("trustFundDataReport", {
          params: { month: month.value, year: year.value },
        });

        if (response.data.length > 0) {
          const filteredData = response.data.reduce(
            (acc, row) => ({
              building_local_80:
                acc.building_local_80 + (parseFloat(row.LOCAL_80_PERCENT) || 0),
              building_trust_15:
                acc.building_trust_15 +
                (parseFloat(row.TRUST_FUND_15_PERCENT) || 0),
              building_national_5:
                acc.building_national_5 +
                (parseFloat(row.NATIONAL_5_PERCENT) || 0),
              electricalfee:
                acc.electricalfee + (parseFloat(row.ELECTRICAL_FEE) || 0),
              zoningfee: acc.zoningfee + (parseFloat(row.ZONING_FEE) || 0),
              livestock_local_80:
                acc.livestock_local_80 +
                (parseFloat(row.LOCAL_80_PERCENT_LIVESTOCK) || 0),
              livestock_national_20:
                acc.livestock_national_20 +
                (parseFloat(row.NATIONAL_20_PERCENT) || 0),
              diving_local_40:
                acc.diving_local_40 +
                (parseFloat(row.LOCAL_40_PERCENT_DIVE_FEE) || 0),
              diving_brgy_30:
                acc.diving_brgy_30 + (parseFloat(row.BRGY_30_PERCENT) || 0),
              diving_fishers_30:
                acc.diving_fishers_30 +
                (parseFloat(row.FISHERS_30_PERCENT) || 0),
            }),
            {
              building_local_80: 0,
              building_trust_15: 0,
              building_national_5: 0,
              electricalfee: 0,
              zoningfee: 0,
              livestock_local_80: 0,
              livestock_national_20: 0,
              diving_local_40: 0,
              diving_brgy_30: 0,
              diving_fishers_30: 0,
            }
          );

          setTFData(filteredData);
        } else {
          console.warn("No data available for selected month and year");
          setTFData({
            building_local_80: 0,
            building_trust_15: 0,
            building_national_5: 0,
            electricalfee: 0,
            zoningfee: 0,
            livestock_local_80: 0,
            livestock_national_20: 0,
            diving_local_40: 0,
            diving_brgy_30: 0,
            diving_fishers_30: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, year]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "cedulaSummaryCollectionDataReport",
          {
            params: {
              month: month.value,
              year: year.value,
            },
          }
        );

        const totalAmountPaid =
          parseFloat(response?.data?.Totalamountpaid) || 0;

        setcData({ TOTALAMOUNTPAID: totalAmountPaid });
      } catch (error) {
        console.error("Error fetching data:", error);
        setcData({ TOTALAMOUNTPAID: 0 });
      }
    };

    fetchData();
  }, [month, year]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("generalFundDataReport", {
          params: {
            month: month.value,
            year: year.value,
          },
        });
        if (response.data.length > 0) {
          const filteredData = response.data.reduce(
            (acc, row) => ({
              manufacturing:
                acc.manufacturing + (parseFloat(row.Manufacturing) || 0),
              distributor: acc.distributor + (parseFloat(row.Distributor) || 0),
              retailing: acc.retailing + (parseFloat(row.Retailing) || 0),
              financial: acc.financial + (parseFloat(row.Financial) || 0),
              otherBusinessTax:
                acc.otherBusinessTax +
                (parseFloat(row.Other_Business_Tax) || 0),
              sandGravel: acc.sandGravel + (parseFloat(row.Sand_Gravel) || 0),
              finesPenalties:
                acc.finesPenalties + (parseFloat(row.Fines_Penalties) || 0),
              mayorsPermit:
                acc.mayorsPermit + (parseFloat(row.Mayors_Permit) || 0),
              weighsMeasure:
                acc.weighsMeasure + (parseFloat(row.Weighs_Measure) || 0),
              tricycleOperators:
                acc.tricycleOperators +
                (parseFloat(row.Tricycle_Operators) || 0),
              occupationTax:
                acc.occupationTax + (parseFloat(row.Occupation_Tax) || 0),
              certOfOwnership:
                acc.certOfOwnership + (parseFloat(row.Cert_of_Ownership) || 0),
              certOfTransfer:
                acc.certOfTransfer + (parseFloat(row.Cert_of_Transfer) || 0),
              cockpitProvShare:
                acc.cockpitProvShare +
                (parseFloat(row.Cockpit_Prov_Share) || 0),
              cockpitLocalShare:
                acc.cockpitLocalShare +
                (parseFloat(row.Cockpit_Local_Share) || 0),
              dockingMooringFee:
                acc.dockingMooringFee +
                (parseFloat(row.Docking_Mooring_Fee) || 0),
              sultadas: acc.sultadas + (parseFloat(row.Sultadas) || 0),
              miscellaneousFee:
                acc.miscellaneousFee + (parseFloat(row.Miscellaneous_Fee) || 0),
              regOfBirth: acc.regOfBirth + (parseFloat(row.Reg_of_Birth) || 0),
              marriageFees:
                acc.marriageFees + (parseFloat(row.Marriage_Fees) || 0),
              burialFees: acc.burialFees + (parseFloat(row.Burial_Fees) || 0),
              correctionOfEntry:
                acc.correctionOfEntry +
                (parseFloat(row.Correction_of_Entry) || 0),
              fishingPermitFee:
                acc.fishingPermitFee +
                (parseFloat(row.Fishing_Permit_Fee) || 0),
              saleOfAgriProd:
                acc.saleOfAgriProd + (parseFloat(row.Sale_of_Agri_Prod) || 0),
              saleOfAcctForm:
                acc.saleOfAcctForm + (parseFloat(row.Sale_of_Acct_Form) || 0),
              waterFees: acc.waterFees + (parseFloat(row.Water_Fees) || 0),
              stallFees: acc.stallFees + (parseFloat(row.Stall_Fees) || 0),
              cashTickets:
                acc.cashTickets + (parseFloat(row.Cash_Tickets) || 0),
              slaughterHouseFee:
                acc.slaughterHouseFee +
                (parseFloat(row.Slaughter_House_Fee) || 0),
              rentalOfEquipment:
                acc.rentalOfEquipment +
                (parseFloat(row.Rental_of_Equipment) || 0),
              docStamp: acc.docStamp + (parseFloat(row.Doc_Stamp) || 0),
              policeReportClearance:
                acc.policeReportClearance +
                (parseFloat(row.Police_Report_Clearance) || 0),
              secretaryfee:
                acc.secretaryfee + (parseFloat(row.Secretaries_Fee) || 0),
              medDentLabFees:
                acc.medDentLabFees + (parseFloat(row.Med_Dent_Lab_Fees) || 0),
              garbageFees:
                acc.garbageFees + (parseFloat(row.Garbage_Fees) || 0),
              cuttingTree:
                acc.cuttingTree + (parseFloat(row.Cutting_Tree) || 0),
            }),
            {
              manufacturing: 0,
              distributor: 0,
              retailing: 0,
              financial: 0,
              otherBusinessTax: 0,
              sandGravel: 0,
              finesPenalties: 0,
              mayorsPermit: 0,
              weighsMeasure: 0,
              tricycleOperators: 0,
              occupationTax: 0,
              certOfOwnership: 0,
              certOfTransfer: 0,
              cockpitProvShare: 0,
              cockpitLocalShare: 0,
              dockingMooringFee: 0,
              sultadas: 0,
              miscellaneousFee: 0,
              regOfBirth: 0,
              marriageFees: 0,
              burialFees: 0,
              correctionOfEntry: 0,
              fishingPermitFee: 0,
              saleOfAgriProd: 0,
              saleOfAcctForm: 0,
              waterFees: 0,
              stallFees: 0,
              cashTickets: 0,
              slaughterHouseFee: 0,
              rentalOfEquipment: 0,
              docStamp: 0,
              policeReportClearance: 0,
              secretaryfee: 0,
              medDentLabFees: 0,
              garbageFees: 0,
              cuttingTree: 0,
            }
          );
          setData(filteredData);
        } else {
          console.error("No data available for selected month and year");
          setData({
            manufacturing: 0,
            distributor: 0,
            retailing: 0,
            financial: 0,
            otherBusinessTax: 0,
            sandGravel: 0,
            finesPenalties: 0,
            mayorsPermit: 0,
            weighsMeasure: 0,
            tricycleOperators: 0,
            occupationTax: 0,
            certOfOwnership: 0,
            certOfTransfer: 0,
            cockpitProvShare: 0,
            cockpitLocalShare: 0,
            dockingMooringFee: 0,
            sultadas: 0,
            miscellaneousFee: 0,
            regOfBirth: 0,
            marriageFees: 0,
            burialFees: 0,
            correctionOfEntry: 0,
            fishingPermitFee: 0,
            saleOfAgriProd: 0,
            saleOfAcctForm: 0,
            waterFees: 0,
            stallFees: 0,
            cashTickets: 0,
            slaughterHouseFee: 0,
            rentalOfEquipment: 0,
            docStamp: 0,
            policeReportClearance: 0,
            secretaryfee: 0,
            medDentLabFees: 0,
            garbageFees: 0,
            cuttingTree: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [month, year]);

  const handleMonthChange = (event, value) => {
    setMonth(value || { label: "January", value: "1" });
  };

  const handleYearChange = (event, value) => {
    setYear(
      value ||
        years.find(
          (option) => option.value === new Date().getFullYear().toString()
        ) || { label: "2025", value: "2025" }
    );
  };

  const totalOverAllAmountNational =
    getValue(tfdata, "building_national_5") +
    getValue(tfdata, "livestock_national_20");

  // You can place this calculation above your return statement
  const totalOverAllAmount =
    // Business Data
    getValue(data, "manufacturing") +
    getValue(data, "distributor") +
    getValue(data, "retailing") +
    getValue(data, "financial") +
    getValue(data, "otherBusinessTax") +
    getValue(data, "sandGravel") +
    getValue(data, "finesPenalties") +
    getValue(data, "mayorsPermit") +
    getValue(data, "weighsMeasure") +
    getValue(data, "tricycleOperators") +
    getValue(data, "occupationTax") +
    getValue(data, "certOfOwnership") +
    getValue(data, "certOfTransfer") +
    getValue(data, "cockpitProvShare") +
    getValue(data, "cockpitLocalShare") +
    getValue(data, "dockingMooringFee") +
    getValue(data, "sultadas") +
    getValue(data, "miscellaneousFee") +
    getValue(data, "regOfBirth") +
    getValue(data, "marriageFees") +
    getValue(data, "burialFees") +
    getValue(data, "correctionOfEntry") +
    getValue(data, "fishingPermitFee") +
    getValue(data, "saleOfAgriProd") +
    getValue(data, "saleOfAcctForm") +
    getValue(data, "waterFees") +
    getValue(data, "stallFees") +
    getValue(data, "cashTickets") +
    getValue(data, "slaughterHouseFee") +
    getValue(data, "rentalOfEquipment") +
    getValue(data, "docStamp") +
    getValue(data, "policeReportClearance") +
    getValue(data, "secretaryfee") +
    getValue(data, "medDentLabFees") +
    getValue(data, "garbageFees") +
    getValue(data, "cuttingTree") +
    // Trust Fund Data
    getValue(tfdata, "building_local_80") +
    getValue(tfdata, "building_trust_15") +
    getValue(tfdata, "building_national_5") +
    getValue(tfdata, "electricalfee") +
    getValue(tfdata, "zoningfee") +
    getValue(tfdata, "livestock_local_80") +
    getValue(tfdata, "livestock_national_20") +
    getValue(tfdata, "diving_local_40") +
    getValue(tfdata, "diving_brgy_30") +
    getValue(tfdata, "diving_fishers_30") +
    // Cedula
    getValue(cdata, "TOTALAMOUNTPAID") +
    // Land Sharing
    getValue(sharingData.LandSharingData.Current, "35% Prov’l Share") +
    getValue(sharingData.LandSharingData.Current, "40% Mun. Share") +
    getValue(sharingData.LandSharingData.Current, "25% Brgy. Share") +
    getValue(sharingData.LandSharingData.Prior, "35% Prov’l Share") +
    getValue(sharingData.LandSharingData.Prior, "40% Mun. Share") +
    getValue(sharingData.LandSharingData.Prior, "25% Brgy. Share") +
    getValue(sharingData.LandSharingData.Penalties, "35% Prov’l Share") +
    getValue(sharingData.LandSharingData.Penalties, "40% Mun. Share") +
    getValue(sharingData.LandSharingData.Penalties, "25% Brgy. Share") +
    // SEF Land Sharing
    getValue(sharingData.sefLandSharingData.Current, "50% Prov’l Share") +
    getValue(sharingData.sefLandSharingData.Current, "50% Mun. Share") +
    getValue(sharingData.sefLandSharingData.Prior, "50% Prov’l Share") +
    getValue(sharingData.sefLandSharingData.Prior, "50% Mun. Share") +
    getValue(sharingData.sefLandSharingData.Penalties, "50% Prov’l Share") +
    getValue(sharingData.sefLandSharingData.Penalties, "50% Mun. Share") +
    // Building Sharing
    getValue(sharingData.buildingSharingData.Current, "35% Prov’l Share") +
    getValue(sharingData.buildingSharingData.Current, "40% Mun. Share") +
    getValue(sharingData.buildingSharingData.Current, "25% Brgy. Share") +
    getValue(sharingData.buildingSharingData.Prior, "35% Prov’l Share") +
    getValue(sharingData.buildingSharingData.Prior, "40% Mun. Share") +
    getValue(sharingData.buildingSharingData.Prior, "25% Brgy. Share") +
    getValue(sharingData.buildingSharingData.Penalties, "35% Prov’l Share") +
    getValue(sharingData.buildingSharingData.Penalties, "40% Mun. Share") +
    getValue(sharingData.buildingSharingData.Penalties, "25% Brgy. Share") +
    // SEF Building Sharing
    getValue(sharingData.sefBuildingSharingData.Current, "50% Prov’l Share") +
    getValue(sharingData.sefBuildingSharingData.Current, "50% Mun. Share") +
    getValue(sharingData.sefBuildingSharingData.Prior, "50% Prov’l Share") +
    getValue(sharingData.sefBuildingSharingData.Prior, "50% Mun. Share") +
    getValue(sharingData.sefBuildingSharingData.Penalties, "50% Prov’l Share") +
    getValue(sharingData.sefBuildingSharingData.Penalties, "50% Mun. Share");

  // TOTAL OVERALL PROVINCIAL GENERAL FUND
  const totalOverAllProvGFAmount =
    toCents(getValue(data, "cockpitProvShare")) +
    toCents(
      getShareValue(sharingData.LandSharingData.Current, "35% Prov’l Share")
    ) +
    toCents(
      getShareValue(sharingData.LandSharingData.Prior, "35% Prov’l Share")
    ) +
    toCents(
      getShareValue(sharingData.LandSharingData.Penalties, "35% Prov’l Share")
    ) +
    toCents(
      getShareValue(sharingData.buildingSharingData.Current, "35% Prov’l Share")
    ) +
    toCents(
      getShareValue(sharingData.buildingSharingData.Prior, "35% Prov’l Share")
    ) +
    toCents(
      getShareValue(
        sharingData.buildingSharingData.Penalties,
        "35% Prov’l Share"
      )
    );

  const values = [
    getShareValue(sharingData.sefLandSharingData.Current, "50% Prov’l Share"),
    getShareValue(sharingData.sefLandSharingData.Prior, "50% Prov’l Share"),
    getShareValue(sharingData.sefLandSharingData.Penalties, "50% Prov’l Share"),
    getShareValue(
      sharingData.sefBuildingSharingData.Current,
      "50% Prov’l Share"
    ),
    getShareValue(sharingData.sefBuildingSharingData.Prior, "50% Prov’l Share"),
    getShareValue(
      sharingData.sefBuildingSharingData.Penalties,
      "50% Prov’l Share"
    ),
  ];

  console.log("🔎 Raw values:");
  values.forEach((v, i) => {
    console.log(`Value[${i}] =`, v, "| precise:", v.toFixed(20));
  });

  const totalOverAllSEFProvCents = Math.round(
    (
      getShareValue(
        sharingData.sefLandSharingData.Current,
        "50% Prov’l Share"
      ) +
      getShareValue(sharingData.sefLandSharingData.Prior, "50% Prov’l Share") +
      getShareValue(
        sharingData.sefLandSharingData.Penalties,
        "50% Prov’l Share"
      ) +
      getShareValue(
        sharingData.sefBuildingSharingData.Current,
        "50% Prov’l Share"
      ) +
      getShareValue(
        sharingData.sefBuildingSharingData.Prior,
        "50% Prov’l Share"
      ) +
      getShareValue(
        sharingData.sefBuildingSharingData.Penalties,
        "50% Prov’l Share"
      )
    ).toFixed(2) * 100
  );

  // Calculate once before JSX
  const provincialTotal = [
    getShareValue(sharingData.LandSharingData.Current, "35% Prov’l Share"),
    getShareValue(sharingData.LandSharingData.Prior, "35% Prov’l Share"),
    getShareValue(sharingData.LandSharingData.Penalties, "35% Prov’l Share"),

    getShareValue(sharingData.sefLandSharingData.Current, "50% Prov’l Share"),
    getShareValue(sharingData.sefLandSharingData.Prior, "50% Prov’l Share"),
    getShareValue(sharingData.sefLandSharingData.Penalties, "50% Prov’l Share"),

    getShareValue(sharingData.buildingSharingData.Current, "35% Prov’l Share"),
    getShareValue(sharingData.buildingSharingData.Prior, "35% Prov’l Share"),
    getShareValue(
      sharingData.buildingSharingData.Penalties,
      "35% Prov’l Share"
    ),

    getShareValue(
      sharingData.sefBuildingSharingData.Current,
      "50% Prov’l Share"
    ),
    getShareValue(sharingData.sefBuildingSharingData.Prior, "50% Prov’l Share"),
    getShareValue(
      sharingData.sefBuildingSharingData.Penalties,
      "50% Prov’l Share"
    ),
  ].reduce((acc, val) => acc + val, 0); // sum all values

  // Format result (2 decimals, with commas)
  const formattedProvincialTotal = provincialTotal
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const totalOverAllMunGFAmount =
    getShareValue(data, "manufacturing") +
    getShareValue(data, "distributor") +
    getShareValue(data, "retailing") +
    getShareValue(data, "financial") +
    getShareValue(data, "otherBusinessTax") +
    getShareValue(data, "sandGravel") +
    getShareValue(data, "finesPenalties") +
    getShareValue(data, "mayorsPermit") +
    getShareValue(data, "weighsMeasure") +
    getShareValue(data, "tricycleOperators") +
    getShareValue(data, "occupationTax") +
    getShareValue(data, "certOfOwnership") +
    getShareValue(data, "certOfTransfer") +
    getShareValue(data, "cockpitLocalShare") +
    getShareValue(data, "dockingMooringFee") +
    getShareValue(data, "sultadas") +
    getShareValue(data, "miscellaneousFee") +
    getShareValue(data, "regOfBirth") +
    getShareValue(data, "marriageFees") +
    getShareValue(data, "burialFees") +
    getShareValue(data, "correctionOfEntry") +
    getShareValue(data, "fishingPermitFee") +
    getShareValue(data, "saleOfAgriProd") +
    getShareValue(data, "saleOfAcctForm") +
    getShareValue(data, "waterFees") +
    getShareValue(data, "stallFees") +
    getShareValue(data, "cashTickets") +
    getShareValue(data, "slaughterHouseFee") +
    getShareValue(data, "rentalOfEquipment") +
    getShareValue(data, "docStamp") +
    getShareValue(data, "policeReportClearance") +
    getShareValue(data, "secretaryfee") +
    getShareValue(data, "medDentLabFees") +
    getShareValue(data, "garbageFees") +
    getShareValue(data, "cuttingTree") +
    getShareValue(cdata, "TOTALAMOUNTPAID") +
    getShareValue(tfdata, "building_local_80") +
    getShareValue(tfdata, "electricalfee") +
    getShareValue(tfdata, "zoningfee") +
    getShareValue(tfdata, "livestock_local_80") +
    getShareValue(tfdata, "diving_local_40") +
    getShareValue(sharingData.LandSharingData.Current, "40% Mun. Share") +
    getShareValue(sharingData.LandSharingData.Prior, "40% Mun. Share") +
    getShareValue(sharingData.LandSharingData.Penalties, "40% Mun. Share") +
    getShareValue(sharingData.buildingSharingData.Current, "40% Mun. Share") +
    getShareValue(sharingData.buildingSharingData.Prior, "40% Mun. Share") +
    getShareValue(sharingData.buildingSharingData.Penalties, "40% Mun. Share");

  const totalOverMunAllAmount =
    getValue(data, "manufacturing") +
    getValue(data, "distributor") +
    getValue(data, "retailing") +
    getValue(data, "financial") +
    getValue(data, "otherBusinessTax") +
    getValue(data, "sandGravel") +
    getValue(data, "finesPenalties") +
    getValue(data, "mayorsPermit") +
    getValue(data, "weighsMeasure") +
    getValue(data, "tricycleOperators") +
    getValue(data, "occupationTax") +
    getValue(data, "certOfOwnership") +
    getValue(data, "certOfTransfer") +
    getValue(data, "cockpitLocalShare") +
    getValue(data, "dockingMooringFee") +
    getValue(data, "sultadas") +
    getValue(data, "miscellaneousFee") +
    getValue(data, "regOfBirth") +
    getValue(data, "marriageFees") +
    getValue(data, "burialFees") +
    getValue(data, "correctionOfEntry") +
    getValue(data, "fishingPermitFee") +
    getValue(data, "saleOfAgriProd") +
    getValue(data, "saleOfAcctForm") +
    getValue(data, "waterFees") +
    getValue(data, "stallFees") +
    getValue(data, "cashTickets") +
    getValue(data, "slaughterHouseFee") +
    getValue(data, "rentalOfEquipment") +
    getValue(data, "docStamp") +
    getValue(data, "policeReportClearance") +
    getValue(data, "secretaryfee") +
    getValue(data, "medDentLabFees") +
    getValue(data, "garbageFees") +
    getValue(data, "cuttingTree") +
    getValue(tfdata, "building_local_80") +
    getValue(tfdata, "building_trust_15") +
    getValue(tfdata, "electricalfee") +
    getValue(tfdata, "zoningfee") +
    getValue(tfdata, "livestock_local_80") +
    getValue(tfdata, "diving_local_40") +
    getValue(cdata, "TOTALAMOUNTPAID") +
    // Land Sharing Data
    getShareValue(sharingData.LandSharingData.Current, "40% Mun. Share") +
    getShareValue(sharingData.LandSharingData.Prior, "40% Mun. Share") +
    getShareValue(sharingData.LandSharingData.Penalties, "40% Mun. Share") +
    // SEF Land Sharing
    getShareValue(sharingData.sefLandSharingData.Current, "50% Mun. Share") +
    getShareValue(sharingData.sefLandSharingData.Prior, "50% Mun. Share") +
    getShareValue(sharingData.sefLandSharingData.Penalties, "50% Mun. Share") +
    // Building Sharing
    getShareValue(sharingData.buildingSharingData.Current, "40% Mun. Share") +
    getShareValue(sharingData.buildingSharingData.Prior, "40% Mun. Share") +
    getShareValue(sharingData.buildingSharingData.Penalties, "40% Mun. Share") +
    // SEF Building Sharing
    getShareValue(
      sharingData.sefBuildingSharingData.Current,
      "50% Mun. Share"
    ) +
    getShareValue(sharingData.sefBuildingSharingData.Prior, "50% Mun. Share") +
    getShareValue(
      sharingData.sefBuildingSharingData.Penalties,
      "50% Mun. Share"
    );

  const municipalSEFTotal = [
    getShareValue(sharingData.sefLandSharingData.Current, "50% Mun. Share"),
    getShareValue(sharingData.sefLandSharingData.Prior, "50% Mun. Share"),
    getShareValue(sharingData.sefLandSharingData.Penalties, "50% Mun. Share"),

    getShareValue(sharingData.sefBuildingSharingData.Current, "50% Mun. Share"),
    getShareValue(sharingData.sefBuildingSharingData.Prior, "50% Mun. Share"),
    getShareValue(
      sharingData.sefBuildingSharingData.Penalties,
      "50% Mun. Share"
    ),
  ].reduce((acc, val) => acc + val, 0);

  // Format result (2 decimals, with commas)
  const formattedMunicipalSEFTotal = municipalSEFTotal
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handlePrint = () => {
    const printContents = document.getElementById("printableArea").innerHTML;

    const printWindow = window.open("", "", "width=800,height=600");

    printWindow.document.write(`
    <html>
      <head>
        <title>SOC_GeneralFundReport_${month.label}_${year.label}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; }
          table { border-collapse: collapse; width: 100%; font-size: 10px; }
          th, td { border: 1px solid black; padding: 6px; text-align: center; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: auto; }
          @media print {
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              text-align: center;
              font-size: 10px;
              color: gray;
            }
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const generateHeaders = () => {
    return [
      ["SUMMARY OF COLLECTIONS", "", "", "", "", "", "", "", "", "", ""],
      ["ZAMBOANGUITA, NEGROS ORIENTAL", "", "", "", "", "", "", "", "", "", ""],
      ["LGU", "", "", "", "", "", "", "", "", "", ""],
      [
        `Month of ${month.label} ${year.label}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [],

      [
        "SOURCES OF COLLECTIONS",
        "TOTAL COLLECTIONS",
        "NATIONAL",
        "PROVINCIAL",
        "",
        "",
        "MUNICIPAL",
        "",
        "",
        "",
        "BARANGAY SHARE",
        "FISHERIES",
      ],
      [
        "",
        "",
        "",
        "GENERAL FUND",
        "SPECIAL EDUC. FUND",
        "TOTAL",
        "GENERAL FUND",
        "SPECIAL EDUC. FUND",
        "TRUST FUND",
        "TOTAL",
        "",
        "",
      ],
    ];
  };

  const readableCategories = {
    LandSharingData: "Real Property Tax - Basic/Land",
    sefLandSharingData: "Real Property Tax - SEF/Land",
    buildingSharingData: "Real Property Tax - Basic/Bldg.",
    sefBuildingSharingData: "Real Property Tax - SEF/Bldg.",
  };

  const handleDownloadExcel = () => {
    const headers = generateHeaders();
    const dataToExport = [];

    const totals = {
      totalCollections: 0,
      national: 0,
      prov35: 0,
      prov50: 0,
      mun40: 0,
      mun50: 0,
      trust: 0,
      brgy: 0,
      fisheries: 0,
    };

    const fmt = (val) => {
      const num = parseFloat(val); // force conversion
      if (isNaN(num)) return 0.0; // fallback if invalid
      return Number(num.toFixed(2));
    };

    const addDataRow = (label, value, provincialValue = null) => {
      const municipalValue = provincialValue ? value - provincialValue : value;

      dataToExport.push([
        label,
        value,
        "", // National
        provincialValue !== null ? provincialValue : "", // Prov Gen Fund
        "",
        "", // Prov SEF & Prov Total
        provincialValue !== null ? municipalValue : value, // Mun Gen Fund
        "",
        "", // Mun SEF & Trust Fund
        provincialValue !== null ? municipalValue : value, // Mun Total
        "", // Brgy
        "", // Fisheries
      ]);
    };

    // Add regular data rows
    [
      ["Manufacturing", data.manufacturing || 0],
      ["Distributor", data.distributor || 0],
      ["Retailing", data.retailing || 0],
      ["Banks & Other Financial Int.", data.financial || 0],
      ["Other Business Tax", data.otherBusinessTax || 0],
      ["Sand & Gravel", data.sandGravel || 0],
      ["Fines & Penalties", data.finesPenalties || 0],
      ["Mayor's Permit", data.mayorsPermit || 0],
      ["Weights & Measures", data.weighsMeasure || 0],
      ["Tricycle Permit Fee", data.tricycleOperators || 0],
      ["Occupation Tax", data.occupationTax || 0],
      ["Cert. of Ownership", data.certOfOwnership || 0],
      ["Cert. of Transfer", data.certOfTransfer || 0],
      [
        "Cockpit Share",
        (data.cockpitLocalShare || 0) + (data.cockpitProvShare || 0),
        data.cockpitProvShare,
      ],
      ["Docking and Mooring Fee", data.dockingMooringFee] || 0,
      ["Sultadas", data.sultadas || 0],
      ["Miscellaneous", data.miscellaneousFee || 0],
      ["Registration of Birth", data.regOfBirth || 0],
      ["Marriage Fees", data.marriageFees || 0],
      ["Burial Fees", data.burialFees || 0],
      ["Correction of Entry", data.correctionOfEntry || 0],
      ["Fishing Permit Fee", data.fishingPermitFee || 0],
      ["Sale of Agri. Prod.", data.saleOfAgriProd || 0],
      ["Sale of Acc. Forms", data.saleOfAcctForm || 0],
      ["Water Fees", data.waterFees || 0],
      ["Market Stall Fee", data.stallFees || 0],
      ["Cash Tickets", data.cashTickets || 0],
      ["Slaughterhouse Fee", data.slaughterHouseFee || 0],
      ["Rent of Equipment", data.rentalOfEquipment || 0],
      ["Doc Stamp Tax", data.docStamp || 0],
      [
        "Secretary Fees",
        (data.secretaryfee || 0) + (data.policeReportClearance || 0),
      ],
      ["Med./Lab. Fees", data.medDentLabFees || 0],
      ["Garbage Fees", data.garbageFees || 0],
      ["Cutting Tree", data.cuttingTree || 0],
      ["Community Tax", cdata.TOTALAMOUNTPAID || 0],
    ].forEach(([label, value, prov]) => addDataRow(label, value, prov));

    // Add fixed rows
    const fixedRows = [
      [
        "Building Permit Fee",
        tfdata.building_local_80 +
          tfdata.building_trust_15 +
          tfdata.building_national_5,
        tfdata.building_national_5,
        "",
        "",
        "",
        tfdata.building_local_80,
        "",
        tfdata.building_trust_15,
        tfdata.building_local_80 + tfdata.building_trust_15,
        "",
        "",
      ],
      [
        "Electrical Permit Fee",
        tfdata.electricalfee,
        "",
        "",
        "",
        "",
        tfdata.electricalfee,
        "",
        "",
        tfdata.electricalfee,
        "",
        "",
      ],
      [
        "Zoning Fee",
        tfdata.zoningfee,
        "",
        "",
        "",
        "",
        tfdata.zoningfee,
        "",
        "",
        tfdata.zoningfee,
        "",
        "",
      ],
      [
        "Livestock",
        tfdata.livestock_local_80 + tfdata.livestock_national_20,
        tfdata.livestock_national_20,
        "",
        "",
        "",
        tfdata.livestock_local_80,
        "",
        "",
        tfdata.livestock_local_80,
        "",
        "",
      ],
      [
        "Diving Fee",
        tfdata.diving_local_40 +
          tfdata.diving_brgy_30 +
          tfdata.diving_fishers_30,
        "",
        "",
        "",
        "",
        tfdata.diving_local_40,
        "",
        "",
        tfdata.diving_local_40,
        tfdata.diving_brgy_30,
        tfdata.diving_fishers_30,
      ],
    ];

    fixedRows.forEach((row) => dataToExport.push(row));

    // sharingData rows
    // Sharing data
    Object.keys(sharingData).forEach((key) => {
      const categoryData = sharingData[key];
      const hasData = Object.values(categoryData).some((row) =>
        Object.values(row).some(
          (value) => value !== 0 && value !== "" && value !== null
        )
      );
      if (!hasData) return;

      const categoryLabel = readableCategories[key] || key;
      dataToExport.push([categoryLabel]);

      Object.keys(categoryData).forEach((subKey) => {
        if (subKey === "TOTAL") return;
        const rowData = categoryData[subKey];
        let totalCollections = 0;

        if (key === "LandSharingData" || key === "buildingSharingData") {
          totalCollections =
            fmt(rowData["35% Prov’l Share"]) +
            fmt(rowData["40% Mun. Share"]) +
            fmt(rowData["25% Brgy. Share"]);
        } else if (
          key === "sefLandSharingData" ||
          key === "sefBuildingSharingData"
        ) {
          totalCollections =
            fmt(rowData["50% Prov’l Share"]) + fmt(rowData["50% Mun. Share"]);
        }

        totals.totalCollections += totalCollections;
        totals.national += fmt(rowData["National"]);
        totals.prov35 += fmt(rowData["35% Prov’l Share"]);
        totals.prov50 += fmt(rowData["50% Prov’l Share"]);
        totals.mun40 += fmt(rowData["40% Mun. Share"]);
        totals.mun50 += fmt(rowData["50% Mun. Share"]);
        totals.trust += fmt(rowData["Municipal Trust Fund"]);
        totals.brgy += fmt(rowData["25% Brgy. Share"]);
        totals.fisheries += fmt(rowData["Fisheries"]);

        dataToExport.push([
          subKey === "Current"
            ? "Current Year"
            : subKey === "Prior"
              ? "Previous Years"
              : "Penalties",
          fmt(totalCollections),
          fmt(rowData["National"]),
          fmt(rowData["35% Prov’l Share"]),
          fmt(rowData["50% Prov’l Share"]),
          fmt(rowData["35% Prov’l Share"]) + fmt(rowData["50% Prov’l Share"]),
          fmt(rowData["40% Mun. Share"]),
          fmt(rowData["50% Mun. Share"]),
          fmt(rowData["Municipal Trust Fund"]),
          fmt(rowData["40% Mun. Share"]) +
            fmt(rowData["50% Mun. Share"]) +
            fmt(rowData["Municipal Trust Fund"]),
          fmt(rowData["25% Brgy. Share"]),
          fmt(rowData["Fisheries"]),
        ]);
      });
    });

    dataToExport.push([
      "TOTAL",
      totalOverAllAmount, //Total Collection
      totalOverAllAmountNational, //National
      totalOverAllProvGFAmount, //Prov General Fund
      totalOverAllSEFProvCents, //Prov SEF
      (sharingData.LandSharingData.Current["35% Prov’l Share"] || 0) +
        (sharingData.LandSharingData.Prior["35% Prov’l Share"] || 0) +
        (sharingData.LandSharingData.Penalties["35% Prov’l Share"] || 0) +
        (sharingData.sefLandSharingData.Current["50% Prov’l Share"] || 0) +
        (sharingData.sefLandSharingData.Prior["50% Prov’l Share"] || 0) +
        (sharingData.sefLandSharingData.Penalties["50% Prov’l Share"] || 0) +
        (sharingData.buildingSharingData.Current["35% Prov’l Share"] || 0) +
        (sharingData.buildingSharingData.Prior["35% Prov’l Share"] || 0) +
        (sharingData.buildingSharingData.Penalties["35% Prov’l Share"] || 0) +
        (sharingData.sefBuildingSharingData.Current["50% Prov’l Share"] || 0) +
        (sharingData.sefBuildingSharingData.Prior["50% Prov’l Share"] || 0) +
        (sharingData.sefBuildingSharingData.Penalties["50% Prov’l Share"] || 0), //Prov TOTAL
      totalOverAllMunGFAmount, //Mun General Fund
      (sharingData.sefLandSharingData.Current["50% Mun. Share"] || 0) +
        (sharingData.sefLandSharingData.Prior["50% Mun. Share"] || 0) +
        (sharingData.sefLandSharingData.Penalties["50% Mun. Share"] || 0) +
        (sharingData.sefBuildingSharingData.Current["50% Mun. Share"] || 0) +
        (sharingData.sefBuildingSharingData.Prior["50% Mun. Share"] || 0) +
        (sharingData.sefBuildingSharingData.Penalties["50% Mun. Share"] || 0), //Mun SEF
      tfdata.building_trust_15, //Mun Trust
      totalOverMunAllAmount, //Mun Total
      (tfdata.diving_brgy_30 || 0) +
        (sharingData.LandSharingData.Current["25% Brgy. Share"] || 0) +
        (sharingData.LandSharingData.Prior["25% Brgy. Share"] || 0) +
        (sharingData.LandSharingData.Penalties["25% Brgy. Share"] || 0) +
        (sharingData.buildingSharingData.Current["25% Brgy. Share"] || 0) +
        (sharingData.buildingSharingData.Prior["25% Brgy. Share"] || 0) +
        (sharingData.buildingSharingData.Penalties["25% Brgy. Share"] || 0), //Barangay
      tfdata.diving_fishers_30, //Fisheries
    ]);

    // Add spacing
    dataToExport.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
    dataToExport.push(["", "", "", "", "", "", "", "", "", "", "", ""]);

    // Signature block
    dataToExport.push([
      "PREPARED BY:",
      "",
      "",
      "",
      "",
      "",
      "",
      "CERTIFIED CORRECT:",
      "",
      "",
      "",
      "",
    ]);

    dataToExport.push([
      "",
      "",
      "RICHER T. ALANANO",
      "",
      "",
      "",
      "",
      "",
      "",
      "PAUL REE AMBROSE A. MARTINEZ",
      "",
      "",
    ]);

    dataToExport.push([
      "",
      "",
      "CASUAL-IT",
      "",
      "",
      "",
      "",
      "",
      "",
      "Municipal Treasurer",
      "",
      "",
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataToExport]);

    // Define merge utility function
    const mergeRange = (startCell, endCell) => {
      const decode = XLSX.utils.decode_cell;
      return { s: decode(startCell), e: decode(endCell) };
    };

    // Add top title merges (A1:L1, A2:L2, A3:L3, A4:L4)
    worksheet["!merges"] = [
      mergeRange("A1", "L1"),
      mergeRange("A2", "L2"),
      mergeRange("A3", "L3"),
      mergeRange("A4", "L4"),
      // Merge headers (row 5, 0-based index = r: 4)
      { s: { r: 4, c: 2 }, e: { r: 4, c: 2 } }, // NATIONAL
      { s: { r: 4, c: 3 }, e: { r: 4, c: 5 } }, // PROVINCIAL
      { s: { r: 4, c: 6 }, e: { r: 4, c: 9 } }, // MUNICIPAL
      { s: { r: 4, c: 10 }, e: { r: 4, c: 10 } }, // BARANGAY SHARE
      { s: { r: 4, c: 11 }, e: { r: 4, c: 11 } }, // FISHERIES
    ];

    // Freeze top 2 rows
    worksheet["!freeze"] = { xSplit: 0, ySplit: 2 };

    // Set column widths
    worksheet["!cols"] = headers[0].map(() => ({ wpx: 160 }));

    // Create and save workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(
      workbook,
      `Summary_Of_Collections_${month.label}_${year.label}_${timestamp}.xlsx`
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box display="flex" gap={2}>
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleMonthChange}
            value={month}
            renderInput={(params) => (
              <TextField {...params} label="Select Month" variant="outlined" />
            )}
          />
          <Autocomplete
            disablePortal
            id="year-selector"
            options={years}
            sx={{
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleYearChange}
            value={year}
            renderInput={(params) => (
              <TextField {...params} label="Select Year" variant="outlined" />
            )}
          />
        </Box>
      </Box>

      <div id="printableArea">
        <Box>
          <Box>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2>SUMMARY OF COLLECTIONS</h2>
              <h4>ZAMBOANGUITA, NEGROS ORIENTAL</h4>
              <h4>LGU</h4>
              <h4>
                Month of {month.label} {year.label}
              </h4>
            </div>

            <TableContainer component={Paper}>
              <Table sx={{ border: "1px solid black" }}>
                <TableHead>
                  {/* First Row */}
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SOURCES OF COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL COLLECTIONS
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      NATIONAL
                    </TableCell>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      PROVINCIAL
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      MUNICIPAL
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      BARANGAY SHARE
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      FISHERIES
                    </TableCell>
                  </TableRow>
                  {/* Second Row */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      GENERAL FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      SPECIAL EDUC. FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TRUST FUND
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      TOTAL
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Manufacturing */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Manufacturing
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.manufacturing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.manufacturing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.manufacturing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  {/* Distributor */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Distributor
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.distributor || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.distributor || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.distributor || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  {/* Retailing */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Retailing
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.retailing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.retailing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.retailing || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  {/*Banks & Other Financial Int. */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Banks & Other Financial Int.
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.financial || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.financial || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.financial || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  <TableRow>
                    {/*Other Business Tax */}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Other Business Tax
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.otherBusinessTax || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.otherBusinessTax || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.otherBusinessTax || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  <TableRow>
                    {/*Sand & Gravel*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Sand & Gravel
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sandGravel || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sandGravel || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sandGravel || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Fines & Penalties*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Fines & Penalties
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.finesPenalties || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.finesPenalties || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.finesPenalties || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Mayor's Permit*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Mayor's Permit
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.mayorsPermit || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.mayorsPermit || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.mayorsPermit || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Weight & Measure*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Weight & Measure
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.weighsMeasure || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.weighsMeasure || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.weighsMeasure || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Tricycle Permit Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Tricycle Permit Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.tricycleOperators || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.tricycleOperators || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.tricycleOperators || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Occupation Tax*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Occupation Tax
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.occupationTax || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {data.occupationTax}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {data.occupationTax}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Certification of Ownership*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Cert. of Ownership
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfOwnership || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfOwnership || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfOwnership || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Certificate of Transfer*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Cert. of Transfer
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfTransfer || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfTransfer || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.certOfTransfer || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Cockpit Share
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        (data.cockpitProvShare || 0) +
                          (data.cockpitLocalShare || 0)
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      {/* TOTAL COLLECTIONS */}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cockpitProvShare || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cockpitLocalShare || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cockpitLocalShare || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Docking and Mooring Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Docking and Mooring Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.dockingMooringFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.dockingMooringFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.dockingMooringFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Sultadas*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Sultadas
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sultadas || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sultadas || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.sultadas || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Miscellaneous*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Miscellaneous
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.miscellaneousFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.miscellaneousFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.miscellaneousFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Registration of Birth*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Registration of Birth
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.regOfBirth || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.regOfBirth || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.regOfBirth || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Marriage Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Marriage Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.marriageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.marriageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.marriageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Burial Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Burial Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.burialFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.burialFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.burialFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Correction of Entry*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Correction of Entry
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.correctionOfEntry || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.correctionOfEntry || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.correctionOfEntry || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Fishing Permit Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Fishing Permit Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.fishingPermitFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.fishingPermitFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.fishingPermitFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Sale of Agri. Prod*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Sale of Agri. Prod.
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAgriProd || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAgriProd || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAgriProd || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Sale of Acct. Forms*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Sale of Acct. Forms
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAcctForm || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAcctForm || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.saleOfAcctForm || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Water Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Water Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.waterFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.waterFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.waterFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Market Stall Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Market Stall Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.stallFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.stallFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.stallFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Cash Tickets*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Cash Tickets
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cashTickets || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cashTickets || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cashTickets || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*SlaughterHouse Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      SlaughterHouse Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.slaughterHouseFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.slaughterHouseFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.slaughterHouseFee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Rental of Equipment*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Rental of Equipment
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.rentalOfEquipment || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.rentalOfEquipment || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.rentalOfEquipment || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Doc Stamp Tax*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Doc Stamp Tax
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.docStamp || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.docStamp || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.docStamp || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Secretary Fees*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Secretary Fees
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {(
                        (Number(data.policeReportClearance) || 0) +
                        (Number(data.secretaryfee) || 0)
                      )
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {(
                        (Number(data.policeReportClearance) || 0) +
                        (Number(data.secretaryfee) || 0)
                      )
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {(
                        (Number(data.policeReportClearance) || 0) +
                        (Number(data.secretaryfee) || 0)
                      )
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Med./Labe. Fees*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Med./Lab. Fees
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.medDentLabFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.medDentLabFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.medDentLabFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>
                  {/* Community Tax Certification */}
                  <TableRow>
                    <React.Fragment>
                      <TableCell
                        align="left"
                        sx={{ border: "1px solid black" }}
                      >
                        Com Tax Cert.
                      </TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      >
                        {Number(cdata.TOTALAMOUNTPAID || 0)
                          .toFixed(2) // keep two decimals
                          .toString() // make it a string
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      >
                        {Number(cdata.TOTALAMOUNTPAID || 0)
                          .toFixed(2) // keep two decimals
                          .toString() // make it a string
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      >
                        {Number(cdata.TOTALAMOUNTPAID || 0)
                          .toFixed(2) // keep two decimals
                          .toString() // make it a string
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ border: "1px solid black" }}
                        align="center"
                      ></TableCell>
                    </React.Fragment>
                  </TableRow>

                  <TableRow>
                    {/*Garbage Fee*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Garbage Fees
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.garbageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.garbageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.garbageFees || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* FISHERIES */}
                  </TableRow>

                  <TableRow>
                    {/*Cutting Tree*/}
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Cutting Tree
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cuttingTree || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cuttingTree || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(data.cuttingTree || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                  </TableRow>

                  {/* Building Permit Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Building Permit Fee
                    </TableCell>

                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        Number(tfdata.building_national_5 || 0) +
                          Number(tfdata.building_local_80 || 0) +
                          Number(tfdata.building_trust_15 || 0)
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>

                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.building_national_5 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>

                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.building_local_80 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>

                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.building_trust_15 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>

                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        (tfdata.building_local_80 || 0) +
                          (tfdata.building_trust_15 || 0)
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>

                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>

                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>
                  {/* Electrical Permit Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Electrical Permit Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.electricalfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>{" "}
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.electricalfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.electricalfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                  </TableRow>

                  {/* Zoning Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Zoning Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.zoningfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.zoningfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.zoningfee || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Livestock */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Livestock
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        (tfdata.livestock_national_20 || 0) +
                          (tfdata.livestock_local_80 || 0)
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.livestock_national_20 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.livestock_local_80 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.livestock_local_80 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Diving Fee */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      Diving Fee
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        (tfdata.diving_local_40 || 0) +
                          (tfdata.diving_brgy_30 || 0) +
                          (tfdata.diving_fishers_30 || 0)
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.diving_local_40 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.diving_local_40 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.diving_brgy_30 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.diving_fishers_30 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                  </TableRow>

                  {/* Real Property Tax-Basic/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-Basic/Land
                    </TableCell>
                    {/* Empty cells for the rest of the columns */}
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items for Real Property Tax-Basic/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.LandSharingData.Current,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.LandSharingData.Current,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.LandSharingData.Current,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Current[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Current[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Current["40% Mun. Share"] ||
                          0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Current["40% Mun. Share"] ||
                          0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Current[
                          "25% Brgy. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.LandSharingData.Prior,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.LandSharingData.Prior,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.LandSharingData.Prior,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Prior["35% Prov’l Share"] ||
                          0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Prior["35% Prov’l Share"] ||
                          0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Prior["40% Mun. Share"] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Prior["40% Mun. Share"] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Prior["25% Brgy. Share"] ||
                          0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.LandSharingData.Penalties,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.LandSharingData.Penalties,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.LandSharingData.Penalties,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Penalties[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Penalties[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Penalties[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Penalties[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.LandSharingData.Penalties[
                          "25% Brgy. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-SEF/Land */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-SEF/Land
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefLandSharingData.Current,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefLandSharingData.Current,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Current[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Current[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Current[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Current[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefLandSharingData.Prior,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefLandSharingData.Prior,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Prior[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Prior[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Prior[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Prior[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefLandSharingData.Penalties,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefLandSharingData.Penalties,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // always 2 decimals
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefLandSharingData.Penalties[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-Basic/Bldg. */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-Basic/Bldg
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.buildingSharingData.Current,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.buildingSharingData.Current,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.buildingSharingData.Current,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Current[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Current[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Current[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Current[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Current[
                          "25% Brgy. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.buildingSharingData.Prior,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.buildingSharingData.Prior,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.buildingSharingData.Prior,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Prior[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Prior[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Prior[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Prior[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Prior[
                          "25% Brgy. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.buildingSharingData.Penalties,
                          "35% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.buildingSharingData.Penalties,
                            "40% Mun. Share"
                          ) +
                          getShareValue(
                            sharingData.buildingSharingData.Penalties,
                            "25% Brgy. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Penalties[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Penalties[
                          "35% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Penalties[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Penalties[
                          "40% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.buildingSharingData.Penalties[
                          "25% Brgy. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Real Property Tax-SEF/Bldg. */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", fontWeight: "bold" }}
                    >
                      Real Property Tax-SEF/Bldg
                    </TableCell>
                    {Array.from({ length: 11 }).map((_, index) => (
                      <TableCell
                        key={index}
                        sx={{ border: "1px solid black" }}
                      />
                    ))}
                  </TableRow>
                  {/* Child items */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Current Year
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefBuildingSharingData.Current,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefBuildingSharingData.Current,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Current[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Previous Years */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Previous Years
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefBuildingSharingData.Prior,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefBuildingSharingData.Prior,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Prior[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* Penalties */}
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{ border: "1px solid black", paddingLeft: 4 }}
                    >
                      Penalties
                    </TableCell>
                    {/* TOTAL COLLECTIONS */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        getShareValue(
                          sharingData.sefBuildingSharingData.Penalties,
                          "50% Prov’l Share"
                        ) +
                          getShareValue(
                            sharingData.sefBuildingSharingData.Penalties,
                            "50% Mun. Share"
                          )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Prov’l Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(
                        sharingData.sefBuildingSharingData.Penalties[
                          "50% Mun. Share"
                        ] || 0
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                    {/* FISHERIES */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    ></TableCell>
                  </TableRow>

                  {/* OVERALL TOTAL */}
                  <TableRow>
                    <TableCell align="left" sx={{ border: "1px solid black" }}>
                      TOTAL
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(totalOverAllAmount || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(totalOverAllAmountNational || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>
                    {/* TOTAL NATIONAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {centsToMoney(totalOverAllProvGFAmount)}
                    </TableCell>
                    {/* TOTAL PROVINCIAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {centsToMoney(totalOverAllSEFProvCents)}
                    </TableCell>{" "}
                    {/* TOTAL PROVINCIAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formattedProvincialTotal}
                    </TableCell>{" "}
                    {/* TOTAL PROVINCIAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {totalOverAllMunGFAmount
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL MUNICIPAL GENERAL FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {formattedMunicipalSEFTotal}
                    </TableCell>{" "}
                    {/* TOTAL MUNICIPAL SPECIAL EDUC. FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.building_trust_15 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL MUNICIPAL TRUST FUND */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(totalOverMunAllAmount || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL MUNICIPAL TOTAL */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {(
                        (tfdata.diving_brgy_30 || 0) +
                        getShareValue(
                          sharingData.LandSharingData.Current,
                          "25% Brgy. Share"
                        ) +
                        getShareValue(
                          sharingData.LandSharingData.Prior,
                          "25% Brgy. Share"
                        ) +
                        getShareValue(
                          sharingData.LandSharingData.Penalties,
                          "25% Brgy. Share"
                        ) +
                        getShareValue(
                          sharingData.buildingSharingData.Current,
                          "25% Brgy. Share"
                        ) +
                        getShareValue(
                          sharingData.buildingSharingData.Prior,
                          "25% Brgy. Share"
                        ) +
                        getShareValue(
                          sharingData.buildingSharingData.Penalties,
                          "25% Brgy. Share"
                        )
                      )
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL BARANGAY SHARE */}
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      align="center"
                    >
                      {Number(tfdata.diving_fishers_30 || 0)
                        .toFixed(2) // keep two decimals
                        .toString() // make it a string
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </TableCell>{" "}
                    {/* TOTAL FISHERIES */}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 4 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "Arial, sans-serif",
                  border: "none",
                  marginTop: "48px",
                }}
              >
                <tbody>
                  <tr style={{ border: "none" }}>
                    {/* Left column */}
                    <td
                      style={{
                        textAlign: "center",
                        verticalAlign: "top",
                        border: "none",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
                        PREPARED BY:
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "4px",
                          marginTop: "48px",
                        }}
                      >
                        RICHER T. ALANANO
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#555" }}>
                        CASUAL-IT
                      </div>
                    </td>

                    {/* Right column */}
                    <td
                      style={{
                        textAlign: "center",
                        verticalAlign: "top",
                        border: "none",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
                        CERTIFIED CORRECT:
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "4px",
                          marginTop: "48px",
                        }}
                      >
                        PAUL REE AMBROSE A. MARTINEZ
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#555" }}>
                        Municipal Treasurer
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>
      </div>
      {/* Printable Area Ends Here */}

      {/* Print Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 10,
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
            borderRadius: "12px",
            padding: "10px 20px",
            fontWeight: 600,
            "&:hover": { backgroundColor: "secondary.main" },
          }}
          startIcon={<PrintIcon />}
        >
          PRINT
        </Button>

        <Button
          variant="outlined"
          color="success"
          onClick={handleDownloadExcel}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
            borderRadius: "12px",
            padding: "10px 20px",
            fontWeight: 600,
            "&:hover": { backgroundColor: "success.light" },
          }}
          startIcon={<FileDownloadIcon />}
        >
          Download to Excel
        </Button>
      </Box>
    </>
  );
}

export default Collection;
