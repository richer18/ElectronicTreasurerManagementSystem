<?php

namespace App\Http\Middleware;

use App\Support\Permissions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeModulePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        $permission = $this->resolvePermission($request);

        if ($permission !== null && ! Permissions::has($user, $permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }

    private function resolvePermission(Request $request): ?string
    {
        $path = ltrim($request->path(), '/');
        $method = strtoupper($request->method());

        $map = [
            'users' => [
                'patterns' => ['api/users*', 'api/roles/permissions'],
                'permissions' => [
                    'GET' => 'users.view',
                    'POST' => 'users.create',
                    'PUT' => 'users.update',
                    'PATCH' => 'users.update',
                    'DELETE' => 'users.update',
                ],
            ],
            'calendar' => [
                'patterns' => ['api/calendar-events*'],
                'permissions' => [
                    'GET' => 'calendar.view',
                    'POST' => 'calendar.manage',
                    'PUT' => 'calendar.manage',
                    'PATCH' => 'calendar.manage',
                    'DELETE' => 'calendar.manage',
                ],
            ],
            'rcd' => [
                'patterns' => [
                    'api/purchases*',
                    'api/form-types',
                    'api/available-forms',
                    'api/update-purchase-form*',
                    'api/assign-forms',
                    'api/issued-forms',
                    'api/accountable-form-returns*',
                    'api/accountability/logs',
                    'api/rcd-entries*',
                    'api/rcd-batches*',
                    'api/rcd/suggested-collections',
                    'api/rcd/verify-password',
                ],
                'permissions' => [
                    'GET' => 'rcd.view',
                    'POST' => 'rcd.create',
                    'PUT' => 'rcd.update',
                    'PATCH' => 'rcd.update',
                    'DELETE' => 'rcd.delete',
                ],
            ],
            'rpt' => [
                'patterns' => [
                    'api/allData',
                    'api/TotalFund',
                    'api/TotalGeneralFund',
                    'api/TotalSEFFund',
                    'api/TotalShareFund',
                    'api/commentRPTCounts',
                    'api/LandSharingData',
                    'api/sefLandSharingData',
                    'api/buildingSharingData',
                    'api/sefBuildingSharingData',
                    'api/landData',
                    'api/bldgData',
                    'api/seflandData',
                    'api/sefbldgData',
                    'api/grandTotalSharing',
                    'api/sefGrandTotalSharing',
                    'api/overallTotalBasicAndSEF',
                    'api/overallTotalBasicAndSEFSharing',
                    'api/getRPTComments*',
                    'api/rpt-json',
                    'api/saverptdata',
                    'api/updaterptdata/*',
                    'api/deleteRPT/*',
                    'api/commentRPTCounts',
                    'api/allDayComment',
                    'api/updateComment',
                    'api/insertComment',
                ],
                'permissions' => [
                    'GET' => 'rpt.view',
                    'POST' => 'rpt.create',
                    'PUT' => 'rpt.update',
                    'PATCH' => 'rpt.update',
                    'DELETE' => 'rpt.delete',
                ],
            ],
            'general_fund' => [
                'patterns' => [
                    'api/generalFundDataAll',
                    'api/general-fund-dashboard-summary',
                    'api/generalFundPaymentRates',
                    'api/generalFundPaymentView*',
                    'api/generalFundPaymentEdit*',
                    'api/TotalGeneralFunds',
                    'api/TaxOnBusinessTotal',
                    'api/RegulatoryFeesTotal',
                    'api/ServiceUserChargesTotal',
                    'api/ReceiptsFromEconomicEnterprisesTotal',
                    'api/allDataGeneralFund',
                    'api/viewalldataGeneralFundTableView',
                    'api/getGFComments*',
                    'api/commentGFCounts',
                    'api/generalFundDataReport',
                    'api/general-fund-total-tax-report',
                    'api/general-fund-tax-on-business-report',
                    'api/general-fund-service-user-charges',
                    'api/general-fund-regulatory-fees-report',
                    'api/general-fund-receipts-from-economic-enterprise-report',
                    'api/generalFundPayment',
                    'api/saveGeneralFundData',
                    'api/updateGeneralFundData/*',
                    'api/deleteGF/*',
                ],
                'permissions' => [
                    'GET' => 'general_fund.view',
                    'POST' => 'general_fund.create',
                    'PUT' => 'general_fund.update',
                    'PATCH' => 'general_fund.update',
                    'DELETE' => 'general_fund.delete',
                ],
            ],
            'trust_fund' => [
                'patterns' => [
                    'api/table-trust-fund-all',
                    'api/trust-fund-dashboard-summary',
                    'api/trustFundPaymentRates',
                    'api/trustFundPaymentView*',
                    'api/trustFundPaymentEdit*',
                    'api/trust-fund-total',
                    'api/BuildingPermitFeeTotal',
                    'api/ElectricalFeeTotal',
                    'api/ZoningFeeTotal',
                    'api/LivestockDevFundTotal',
                    'api/DivingFeeTotal',
                    'api/allDataTrustFund',
                    'api/viewalldataTrustFundTableView',
                    'api/getTFComments*',
                    'api/commentTFCounts',
                    'api/trust-fund-building-permit-fees',
                    'api/trust-fund-total-fees-reports',
                    'api/trust-fund-electrical-permit-fees',
                    'api/trust-fund-zoning-permit-fees',
                    'api/trust-fund-livestock-dev-fund-fees',
                    'api/trust-fund-diving-fees',
                    'api/trustFundDataReport',
                    'api/trustFundPayment',
                    'api/save-trust-fund',
                    'api/update-trust-fund/*',
                    'api/updateTFComment',
                    'api/insertTFComment',
                    'api/deleteTF/*',
                ],
                'permissions' => [
                    'GET' => 'trust_fund.view',
                    'POST' => 'trust_fund.create',
                    'PUT' => 'trust_fund.update',
                    'PATCH' => 'trust_fund.update',
                    'DELETE' => 'trust_fund.delete',
                ],
            ],
            'cedula' => [
                'patterns' => [
                    'api/cedula',
                    'api/cedula-raw',
                    'api/CedulaDailyCollection',
                    'api/viewDailyCollectionDetailsCedula',
                    'api/getCedulaComments*',
                    'api/commentCedulaCounts',
                    'api/cedulaSummaryCollectionDataReport',
                    'api/cedula/monthly',
                    'api/saveCedulaData',
                    'api/updateCedulaData/*',
                    'api/deleteCedula/*',
                ],
                'permissions' => [
                    'GET' => 'cedula.view',
                    'POST' => 'cedula.create',
                    'PUT' => 'cedula.update',
                    'PATCH' => 'cedula.update',
                    'DELETE' => 'cedula.delete',
                ],
            ],
            'reports' => [
                'patterns' => [
                    'api/fetch-report',
                    'api/procurement*',
                    'api/tax/monthly',
                    'api/TaxOnBusinessBreakdown',
                    'api/ServiceUserChargesBreakdown',
                    'api/RegulatoryFeesAndChargesBreakdown',
                    'api/ReceiptsFromEconomicEntBreakdown',
                    'api/generate-report',
                    'api/update-report',
                    'api/save-adjustment',
                ],
                'permissions' => [
                    'GET' => 'reports.view',
                    'POST' => 'reports.export',
                    'PUT' => 'reports.export',
                    'PATCH' => 'reports.export',
                    'DELETE' => 'reports.export',
                ],
            ],
            'business' => [
                'patterns' => [
                    'api/datapsic',
                    'api/bplo*',
                    'api/bpls*',
                    'api/total-registered/list',
                    'api/total-renew',
                    'api/total-renew/list',
                    'api/TotalRegistered',
                    'api/TotalExpiry',
                    'api/TotalExpired',
                    'api/TotalSummary',
                    'api/bplo/total-revenue/*',
                ],
                'permissions' => [
                    'GET' => 'business.view',
                    'POST' => 'business.create',
                    'PUT' => 'business.update',
                    'PATCH' => 'business.update',
                    'DELETE' => 'business.delete',
                ],
            ],
            'waterworks' => [
                'patterns' => [
                    'api/register',
                    'api/accounts',
                    'api/account/*',
                    'api/check-storage',
                    'api/test-json',
                    'api/test-save',
                ],
                'permissions' => [
                    'GET' => 'waterworks.view',
                    'POST' => 'waterworks.create',
                    'PUT' => 'waterworks.update',
                    'PATCH' => 'waterworks.update',
                    'DELETE' => 'waterworks.delete',
                ],
            ],
        ];

        foreach ($map as $entry) {
            foreach ($entry['patterns'] as $pattern) {
                if (fnmatch($pattern, $path)) {
                    return $entry['permissions'][$method] ?? null;
                }
            }
        }

        return null;
    }
}
