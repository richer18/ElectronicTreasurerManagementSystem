<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Models\Cedula;
use App\Models\GeneralFundData;
use App\Models\TrustFundData;
use App\Models\RealPropertyTaxData;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\RealPropertyTaxController;
use App\Http\Controllers\RealPropertyTaxControllerTotalFund;
use App\Http\Controllers\RealPropertyTaxControllerTotalGeneralFund;
use App\Http\Controllers\RealPropertyTaxControllerTotalSEFFund;
use App\Http\Controllers\RealPropertyTaxControllerTotalShareFund;
use App\Http\Controllers\RealPropertyTaxSaveDataController;
use App\Http\Controllers\RealPropertyTaxUpdateDataController;
use App\Http\Controllers\RealPropertyTaxDeleteDataController;
use App\Http\Controllers\RealPropertyTaxDataCommentRPTCountsController;
use App\Http\Controllers\RealPropertyTaxDataAllDayCommentController;
use App\Http\Controllers\RealPropertyTaxDataGetRPTCommentsController;
use App\Http\Controllers\RealPropertyTaxDataLandSharingDataController;
use App\Http\Controllers\RealPropertyTaxDataSefLandSharingDataController;
use App\Http\Controllers\RealPropertyTaxDataBuildingSharingDataController;
use App\Http\Controllers\RealPropertyTaxDataSefBuildingSharingDataController;
use App\Http\Controllers\RealPropertyTaxDataLandDataController;
use App\Http\Controllers\RealPropertyTaxDataBldgDataController;
use App\Http\Controllers\RealPropertyTaxDataSefLandDataController;
use App\Http\Controllers\RealPropertyTaxDataSefBldgDataController;
use App\Http\Controllers\RealPropertyTaxDataGrandTotalSharingController;
use App\Http\Controllers\RealPropertyTaxDataSefGrandTotalSharingController;
use App\Http\Controllers\RealPropertyTaxDataOverAllTotalBasicAndSEFController;
use App\Http\Controllers\RealPropertyTaxDataOverAllTotalBasicAndSEFSharingController;
use App\Http\Controllers\RealPropertyTaxDataViewDialogUpdateCommentController;
use App\Http\Controllers\RealPropertyTaxDataViewDialogInsertCommentController;


use App\Http\Controllers\GeneralFundDataAllController;
use App\Http\Controllers\GeneralFundDataTotalFundsController;
use App\Http\Controllers\GeneralFundDataTaxOnBusinessTotalController;
use App\Http\Controllers\GeneralFundDataRegulatoryFeesTotalController;
use App\Http\Controllers\GeneralFundDataServiceUserChargesTotalController;
use App\Http\Controllers\GeneralFundDataReceiptsFromEconomicEnterprisesTotalController;
use App\Http\Controllers\GeneralFundDataUpdateGeneralFundDataController;
use App\Http\Controllers\GeneralFundDataSaveGeneralFundDataController;
use App\Http\Controllers\GeneralFundDataDeleteGFController;
use App\Http\Controllers\GeneralFundDataAllDataGeneralFundController;
use App\Http\Controllers\GeneralFundDataViewalldataGeneralFundTableViewController;
use App\Http\Controllers\GeneralFundDataGetGFCommentsController;
use App\Http\Controllers\GeneralFundDataCommentGFCountsController;
use App\Http\Controllers\GeneralFundDataGenerateReportController;
use App\Http\Controllers\GeneralFundDataGeneralFundDataReportController;
use App\Http\Controllers\GeneralFundTotalTaxReportController;
use App\Http\Controllers\GeneralFundDataTaxOnBusinessReportController;
use App\Http\Controllers\GeneralFundDataServiceUserChargesController;
use App\Http\Controllers\GeneralFundDataRegulatoryFeesController;
use App\Http\Controllers\GeneralFundDataReceiptsFromEconomicEnterpriseController;
use App\Http\Controllers\GeneralFundPaymentViewController;
use App\Http\Controllers\GeneralFundPaymentEditController;
use App\Http\Controllers\GeneralFundPaymentCreateController;
use App\Http\Controllers\GeneralFundPaymentRateOptionsController;

use App\Http\Controllers\TrustFundDataAllDataController;
use App\Http\Controllers\TrustFundDataTotalAllDataController;
use App\Http\Controllers\TrustFundDataBuildingPermitFeeTotalController;
use App\Http\Controllers\TrustFundDataElectricalFeeTotalController;
use App\Http\Controllers\TrustFundDataZoningFeeTotalController;
use App\Http\Controllers\TrustFundDataLivestockDevFundTotalController;
use App\Http\Controllers\TrustFundDataDivingFeeTotalController;
use App\Http\Controllers\TrustFundDataAllDataTrustFundController;
use App\Http\Controllers\TrustFundDataViewAllDataTrustFundTableViewController;
use App\Http\Controllers\TrustFundDataGetTFCommentsController;
use App\Http\Controllers\TrustFundDataCommentTFCountsController;
use App\Http\Controllers\TrustFundDataUpdateTFCommentController;
use App\Http\Controllers\TrustFundDataInsertTFCommentController;
use App\Http\Controllers\TrustFundDataBuildingPermitFeesController;
use App\Http\Controllers\TrustFundDataTotalFeesReportsController;
use App\Http\Controllers\TrustFundDataElectricalPermitFeesController;
use App\Http\Controllers\TrustFundDataZoningPermitFeesController;
use App\Http\Controllers\TrustFundDataLivestockDevFundFeesController;
use App\Http\Controllers\TrustFundDataDivingFeesController;
use App\Http\Controllers\TrustFundDataSaveDataController;
use App\Http\Controllers\TrustFundDataUpdateDataController;
use App\Http\Controllers\TrustFundDataReportDataController;
use App\Http\Controllers\TrustFundDashboardSummaryController;
use App\Http\Controllers\TrustFundPaymentViewController;
use App\Http\Controllers\TrustFundPaymentRateOptionsController;
use App\Http\Controllers\TrustFundPaymentCreateController;
use App\Http\Controllers\TrustFundPaymentEditController;
use App\Http\Controllers\TrustFundPaymentDeleteController;

use App\Http\Controllers\CommunityTaxCertificateCedulaDataController;
use App\Http\Controllers\CommunityTaxCertificateCedulaDailyCollectionController;
use App\Http\Controllers\CommunityTaxCertificateViewDailyCollectionDetailsCedulaController;
use App\Http\Controllers\CommunityTaxCertificateGetCedulaCommentsController;
use App\Http\Controllers\CommunityTaxCertificateCommentCedulaCountsController;
use App\Http\Controllers\CommunityTaxCertificateSummaryCollectionDataReportController;
use App\Http\Controllers\CommunityTaxCertificateSaveCedulaDataController;
use App\Http\Controllers\CommunityTaxCertificateUpdateCedulaDataController;

use App\Http\Controllers\TotalTaxCollectedDataController;
use App\Http\Controllers\TaxOnBusinessBreakdownDataController;
use App\Http\Controllers\ServiceUserChargesBreakdownDataController;
use App\Http\Controllers\RegulatoryFeesAndChargesBreakdownDataController;
use App\Http\Controllers\ReceiptsFromEconomicEntBreakdownDataController;

use App\Http\Controllers\FetchReportDataController;
use App\Http\Controllers\UpdateReportDataController;
use App\Http\Controllers\SaveAdjustmentDataController;

use App\Http\Controllers\PsicCodeDataController;
use App\Http\Controllers\CommunityTaxCertificateDeleteCedulaDataController;
use App\Http\Controllers\CalendarEventController;

use App\Http\Controllers\WaterWorksRegisterJSONDataController;
use App\Http\Controllers\WaterWorksAccountsJSONDataController;
use App\Http\Controllers\WaterWorksAccountNumberJSONDataController;
use App\Http\Controllers\WaterWorksAccountNumberPaymentJSONDataController;

use App\Http\Controllers\BploRecordController;
use App\Http\Controllers\TotalRevenueController;
use App\Http\Controllers\TotalRegisteredController;
use App\Http\Controllers\TotalRenewController;
use App\Http\Controllers\TotalExpiryController;
use App\Http\Controllers\TotalExpiredController;

use App\Http\Controllers\TotalSummaryController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\FormTypeController;
use App\Http\Controllers\AssignFormController;
use App\Http\Controllers\IssuedFormController;
use App\Http\Controllers\RcdEntryController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json(['message' => 'ping from Laravel']);
});

Route::get('/calendar-events', [CalendarEventController::class, 'index']);
Route::post('/calendar-events', [CalendarEventController::class, 'store']);
Route::post('/calendar-events/presets/philippines/{year}', [CalendarEventController::class, 'loadPhilippineHolidays']);
Route::put('/calendar-events/{calendarEvent}', [CalendarEventController::class, 'update']);
Route::delete('/calendar-events/{calendarEvent}', [CalendarEventController::class, 'destroy']);
Route::get('/calendar-events/{calendarEvent}/attachment', [CalendarEventController::class, 'attachment']);

Route::get('/cedula', function () {
    return Cedula::all();
});

Route::get('/general_fund_data', function () {
    return GeneralFundData::all();
});

Route::get('/trust_fund_data', function () {
    return TrustFundData::all();
});

Route::get('/real_property_tax_data', function () {
    return RealPropertyTaxData::all();
});

Route::post('/login', function (Request $request) {
    $user = DB::table('users')->where('USERNAME', $request->username)->first();

    if (!$user || !Hash::check($request->password, $user->PASSWORD_HASH)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    return response()->json([
        'message' => 'Login successful',
        'user' => [
            'id' => $user->USER_ID,
            'username' => $user->USERNAME,
            'role' => $user->ROLE,
            'status' => $user->ACCOUNT_STATUS,
        ]
    ]);
});

Route::get('/rpt-json', function () {
    $path = storage_path('app/public/rpt_data.json');

    if (!file_exists($path)) {
        return response()->json(['error' => 'Data not exported yet'], 404);
    }

    $data = json_decode(file_get_contents($path), true);
    return response()->json($data);
});


Route::get('/allData', [RealPropertyTaxController::class, 'allData']);
Route::get('/TotalFund', [RealPropertyTaxControllerTotalFund::class, 'index']);
Route::get('/TotalGeneralFund', [RealPropertyTaxControllerTotalGeneralFund::class, 'index']);
Route::get('/TotalSEFFund', [RealPropertyTaxControllerTotalSEFFund::class, 'index']);
Route::get('/TotalShareFund', [RealPropertyTaxControllerTotalShareFund::class, 'index']);
Route::post('/saverptdata', [RealPropertyTaxSaveDataController::class, 'store']);
Route::put('/updaterptdata/{id}', [RealPropertyTaxUpdateDataController::class, 'update']);
Route::delete('/deleteRPT/{id}', [RealPropertyTaxDeleteDataController::class, 'destroy']);
Route::get('/commentRPTCounts', [RealPropertyTaxDataCommentRPTCountsController::class, 'index']);
Route::post('/allDayComment', [RealPropertyTaxDataAllDayCommentController::class, 'store']);
Route::get('/LandSharingData', [RealPropertyTaxDataLandSharingDataController::class, 'index']);
Route::get('/sefLandSharingData', [RealPropertyTaxDataSefLandSharingDataController::class, 'index']);
Route::get('/buildingSharingData', [RealPropertyTaxDataBuildingSharingDataController::class, 'index']);
Route::get('/sefBuildingSharingData', [RealPropertyTaxDataSefBuildingSharingDataController::class, 'index']);
Route::get('/landData', [RealPropertyTaxDataLandDataController::class, 'index']);
Route::get('/bldgData', [RealPropertyTaxDataBldgDataController::class, 'index']);
Route::get('/seflandData', [RealPropertyTaxDataSefLandDataController::class, 'index']);
Route::get('/sefbldgData', [RealPropertyTaxDataSefBldgDataController::class, 'index']);
Route::get('/grandTotalSharing', [RealPropertyTaxDataGrandTotalSharingController::class, 'index']);
Route::get('/sefGrandTotalSharing', [RealPropertyTaxDataSefGrandTotalSharingController::class, 'index']);
Route::get('/overallTotalBasicAndSEF', [RealPropertyTaxDataOverAllTotalBasicAndSEFController::class, 'index']);
Route::get('/overallTotalBasicAndSEFSharing', [RealPropertyTaxDataOverAllTotalBasicAndSEFSharingController::class, 'index']);
Route::post('/updateComment', [RealPropertyTaxDataViewDialogUpdateCommentController::class, 'update']);
Route::post('/insertComment', [RealPropertyTaxDataViewDialogInsertCommentController::class, 'insert']);

Route::get('/generalFundDataAll', [GeneralFundDataAllController::class, 'index']);
Route::get('/generalFundPaymentRates', [GeneralFundPaymentRateOptionsController::class, 'index']);
Route::post('/generalFundPayment', [GeneralFundPaymentCreateController::class, 'store']);
Route::get('/generalFundPaymentView/{paymentId}', [GeneralFundPaymentViewController::class, 'show']);
Route::get('/generalFundPaymentEdit/{paymentId}', [GeneralFundPaymentEditController::class, 'show']);
Route::put('/generalFundPaymentEdit/{paymentId}', [GeneralFundPaymentEditController::class, 'update']);
Route::get('/TotalGeneralFunds', [GeneralFundDataTotalFundsController::class, 'index']);
Route::get('/TaxOnBusinessTotal', [GeneralFundDataTaxOnBusinessTotalController::class, 'index']);
Route::get('/RegulatoryFeesTotal', [GeneralFundDataRegulatoryFeesTotalController::class, 'index']);
Route::get('/ServiceUserChargesTotal', [GeneralFundDataServiceUserChargesTotalController::class, 'index']);
Route::get('/ReceiptsFromEconomicEnterprisesTotal', [GeneralFundDataReceiptsFromEconomicEnterprisesTotalController::class, 'index']);
Route::put('/updateGeneralFundData/{id}', [GeneralFundDataUpdateGeneralFundDataController::class, 'update']);
Route::post('/saveGeneralFundData', [GeneralFundDataSaveGeneralFundDataController::class, 'store']);
Route::delete('/deleteGF/{id}', [GeneralFundDataDeleteGFController::class, 'destroy']);
Route::get('/allDataGeneralFund', [GeneralFundDataAllDataGeneralFundController::class, 'index']);
Route::get('/viewalldataGeneralFundTableView', [GeneralFundDataViewalldataGeneralFundTableViewController::class, 'index']);
Route::get('/getGFComments/{date}', [GeneralFundDataGetGFCommentsController::class, 'show']);
Route::get('/commentGFCounts', [GeneralFundDataCommentGFCountsController::class, 'index']);
Route::post('/generate-report', [GeneralFundDataGenerateReportController::class, 'generate']);
Route::get('/generalFundDataReport', [GeneralFundDataGeneralFundDataReportController::class, 'index']);
Route::get('/getRPTComments/{date}', [RealPropertyTaxDataGetRPTCommentsController::class, 'show']);
Route::get('/general-fund-total-tax-report', [GeneralFundTotalTaxReportController::class, 'index']);
Route::get('/general-fund-tax-on-business-report', [GeneralFundDataTaxOnBusinessReportController::class, 'index']);
Route::get('/general-fund-service-user-charges', [GeneralFundDataServiceUserChargesController::class, 'index']);
Route::get('/general-fund-regulatory-fees-report', [GeneralFundDataRegulatoryFeesController::class, 'index']);
Route::get('/general-fund-receipts-from-economic-enterprise-report', [GeneralFundDataReceiptsFromEconomicEnterpriseController::class, 'index']);

Route::get('/table-trust-fund-all', [TrustFundDataAllDataController::class, 'index']);
Route::get('/trust-fund-dashboard-summary', [TrustFundDashboardSummaryController::class, 'index']);
Route::get('/trustFundPaymentRates', [TrustFundPaymentRateOptionsController::class, 'index']);
Route::post('/trustFundPayment', [TrustFundPaymentCreateController::class, 'store']);
Route::get('/trustFundPaymentView/{paymentId}', [TrustFundPaymentViewController::class, 'show']);
Route::get('/trustFundPaymentEdit/{paymentId}', [TrustFundPaymentEditController::class, 'show']);
Route::put('/trustFundPaymentEdit/{paymentId}', [TrustFundPaymentEditController::class, 'update']);
Route::delete('/deleteTF/{id}', [TrustFundPaymentDeleteController::class, 'destroy']);
Route::get('/trust-fund-total', [TrustFundDataTotalAllDataController::class, 'index']);
Route::get('/BuildingPermitFeeTotal', [TrustFundDataBuildingPermitFeeTotalController::class, 'index']);
Route::get('/ElectricalFeeTotal', [TrustFundDataElectricalFeeTotalController::class, 'index']);
Route::get('/ZoningFeeTotal', [TrustFundDataZoningFeeTotalController::class, 'index']);
Route::get('/LivestockDevFundTotal', [TrustFundDataLivestockDevFundTotalController::class, 'index']);
Route::get('/DivingFeeTotal', [TrustFundDataDivingFeeTotalController::class, 'index']);

Route::get('/allDataTrustFund', [TrustFundDataAllDataTrustFundController::class, 'index']);
Route::get('/viewalldataTrustFundTableView', [TrustFundDataViewAllDataTrustFundTableViewController::class, 'index']);
Route::get('/getTFComments/{date}', [TrustFundDataGetTFCommentsController::class, 'show']);
Route::get('/commentTFCounts', [TrustFundDataCommentTFCountsController::class, 'index']);
Route::post('/updateTFComment', TrustFundDataUpdateTFCommentController::class);
Route::post('/insertTFComment', TrustFundDataInsertTFCommentController::class);
Route::get('/trust-fund-building-permit-fees', [TrustFundDataBuildingPermitFeesController::class, 'index']);
Route::get('/trust-fund-total-fees-reports', TrustFundDataTotalFeesReportsController::class);
Route::get('/trust-fund-electrical-permit-fees', TrustFundDataElectricalPermitFeesController::class);
Route::get('/trust-fund-zoning-permit-fees', TrustFundDataZoningPermitFeesController::class);
Route::get('/trust-fund-livestock-dev-fund-fees', TrustFundDataLivestockDevFundFeesController::class);
Route::get('/trust-fund-diving-fees', TrustFundDataDivingFeesController::class);
Route::post('/save-trust-fund', [TrustFundDataSaveDataController::class, 'store']);
Route::put('/update-trust-fund/{id}', [TrustFundDataUpdateDataController::class, 'update']);
Route::get('/trustFundDataReport', [TrustFundDataReportDataController::class, 'index']);

Route::get('/cedula', [CommunityTaxCertificateCedulaDataController::class, 'index']);
Route::get('/CedulaDailyCollection', [CommunityTaxCertificateCedulaDailyCollectionController::class, 'index']);
Route::get('/viewDailyCollectionDetailsCedula', [CommunityTaxCertificateViewDailyCollectionDetailsCedulaController::class, 'index']);
Route::get('/getCedulaComments/{date}', [CommunityTaxCertificateGetCedulaCommentsController::class, 'show']);
Route::get('/commentCedulaCounts', [CommunityTaxCertificateCommentCedulaCountsController::class, 'index']);
Route::get('/cedulaSummaryCollectionDataReport', [CommunityTaxCertificateSummaryCollectionDataReportController::class, 'index']);
Route::get('/cedula/monthly', [CommunityTaxCertificateSummaryCollectionDataReportController::class, 'monthlyTrend']);
Route::post('/saveCedulaData', [CommunityTaxCertificateSaveCedulaDataController::class, 'store']);
Route::put('/updateCedulaData/{ctcno}', [CommunityTaxCertificateUpdateCedulaDataController::class, 'update']);

Route::get('/tax/monthly', [TotalTaxCollectedDataController::class, 'monthlyData']);
Route::get('/TaxOnBusinessBreakdown', [TaxOnBusinessBreakdownDataController::class, 'index']);
Route::get('/ServiceUserChargesBreakdown', [ServiceUserChargesBreakdownDataController::class, 'index']);
Route::get('/RegulatoryFeesAndChargesBreakdown', [RegulatoryFeesAndChargesBreakdownDataController::class, 'index']);
Route::get('/ReceiptsFromEconomicEntBreakdown', [ReceiptsFromEconomicEntBreakdownDataController::class, 'index']);

Route::get('/fetch-report', [FetchReportDataController::class, 'fetchReport']);
Route::post('/update-report', [UpdateReportDataController::class, 'updateReport']);
Route::post('/save-adjustment', [SaveAdjustmentDataController::class, 'saveAdjustment']);

Route::get('/datapsic', [PsicCodeDataController::class, 'getDataPsic']);
Route::delete('/deleteCedula/{id}', [CommunityTaxCertificateDeleteCedulaDataController::class, 'delete']);

Route::post('/register', [WaterWorksRegisterJSONDataController::class, 'register']);
Route::get('/accounts', [WaterWorksAccountsJSONDataController::class, 'index']);
Route::get('/account/{accountNumber}', [WaterWorksAccountNumberJSONDataController::class, 'show']);
Route::post('/account/{accountNumber}/pay', [WaterWorksAccountNumberPaymentJSONDataController::class, 'pay']);


Route::get('/test-json', function () {
    $dataDir = storage_path("waterworks");

    if (!File::exists($dataDir)) {
        File::makeDirectory($dataDir, 0777, true, true);
    }

    $filePath = $dataDir . DIRECTORY_SEPARATOR . "test.json";

    $testData = [
        "time" => now()->toDateTimeString(),
        "message" => "Test JSON write"
    ];

    File::put($filePath, json_encode($testData, JSON_PRETTY_PRINT));

    return response()->json([
        "saved_to" => $filePath,
        "exists" => File::exists($filePath)
    ]);
});


Route::get('/check-storage', function () {
    return storage_path('waterworks');
});

Route::get("/test-save", [WaterWorksRegisterJSONDataController::class, "testSave"]);



//MCH
Route::get('bplo/registered-mch', [BploRecordController::class, 'registeredMch']);
Route::get('/total-renew/list', [TotalRenewController::class, 'list']);
Route::apiResource('bplo', BploRecordController::class);
Route::get('/bplo', [BploRecordController::class, 'index']);      // All records
Route::get('/bplo/{id}', [BploRecordController::class, 'show']);  // One record
Route::post('/bplo', [BploRecordController::class, 'store']);     // Create
Route::put('/bplo/{id}', [BploRecordController::class, 'update']); // Update
Route::delete('/bplo/{id}', [BploRecordController::class, 'destroy']); // Delete


Route::get('bplo/total-revenue/yearly', [TotalRevenueController::class, 'yearly']);
Route::get('bplo/total-revenue/overall', [TotalRevenueController::class, 'overall']);
Route::get('/total-registered/list', [TotalRegisteredController::class, 'list']); // full details
Route::get('/total-renew', [TotalRenewController::class, 'index']);
Route::get('/total-renew/list', [TotalRenewController::class, 'list']);
Route::get('/TotalRegistered', [TotalRegisteredController::class, 'index']);
// Route::get('/TotalRenew', [TotalRenewController::class, 'index']);
Route::get('/TotalExpiry', [TotalExpiryController::class, 'index']);
Route::get('/TotalExpired', [TotalExpiredController::class, 'index']);

Route::get('/TotalSummary', [TotalSummaryController::class, 'index']);

Route::get('/purchases', [PurchaseController::class, 'index']);
Route::get('/purchases/{id}', [PurchaseController::class, 'show']);
Route::post('/purchases', [PurchaseController::class, 'store']);
Route::get('/form-types', [FormTypeController::class, 'index']);
Route::get('/available-forms', [PurchaseController::class, 'availableForms']);
Route::put('/update-purchase-form/{serial}', [PurchaseController::class, 'updateStatus']);
Route::post('/assign-forms', [AssignFormController::class, 'store']);
Route::get('/issued-forms', [IssuedFormController::class, 'index']);
Route::get('/rcd-entries', [RcdEntryController::class, 'index']);
Route::post('/rcd-entries', [RcdEntryController::class, 'store']);
Route::put('/rcd-entries/{id}', [RcdEntryController::class, 'update']);
