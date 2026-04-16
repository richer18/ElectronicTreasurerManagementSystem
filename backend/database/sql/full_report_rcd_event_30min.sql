USE zamboanguita_taxpayer;

-- MySQL table triggers are row-based; they cannot run on a clock.
-- This file adds a 30-minute EVENT that re-syncs full_report_rcd by
-- reusing the existing refresh_full_report_rcd_for_date procedure.
--
-- Before relying on this event, ensure the scheduler is enabled:
--   SET GLOBAL event_scheduler = ON;

DELIMITER $$

DROP PROCEDURE IF EXISTS refresh_full_report_rcd_all $$
CREATE PROCEDURE refresh_full_report_rcd_all()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_report_date DATE;

    DECLARE report_dates CURSOR FOR
        SELECT src.report_date
        FROM (
            SELECT DISTINCT DATE AS report_date
            FROM real_property_tax_payment

            UNION

            SELECT DISTINCT DATEISSUED AS report_date
            FROM community_tax_certificate_payment

            UNION

            SELECT DISTINCT DATE(PAYMENTDATE) AS report_date
            FROM general_fund_payment
            WHERE PAYMENTDATE IS NOT NULL

            UNION

            SELECT DISTINCT DATE AS report_date
            FROM trust_fund_payment
        ) AS src
        WHERE src.report_date IS NOT NULL
        ORDER BY src.report_date;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN report_dates;

    refresh_loop: LOOP
        FETCH report_dates INTO v_report_date;

        IF done = 1 THEN
            LEAVE refresh_loop;
        END IF;

        CALL refresh_full_report_rcd_for_date(v_report_date);
    END LOOP;

    CLOSE report_dates;
END $$

DROP EVENT IF EXISTS ev_full_report_rcd_refresh_30m $$
CREATE EVENT ev_full_report_rcd_refresh_30m
    ON SCHEDULE EVERY 30 MINUTE
    STARTS CURRENT_TIMESTAMP + INTERVAL 30 MINUTE
    DO
BEGIN
    CALL refresh_full_report_rcd_all();
END $$

DELIMITER ;

-- Optional one-time backfill/sanity run after creating the procedure and event.
CALL refresh_full_report_rcd_all();
