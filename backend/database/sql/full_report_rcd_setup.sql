USE zamboanguita_taxpayer;

CREATE TABLE IF NOT EXISTS full_report_rcd (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    GF DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    TF DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    ctc DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    rpt DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    gfAndTf DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    dueFrom DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    comment VARCHAR(255) NOT NULL DEFAULT '',
    CTCunder DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    CTCover DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    RPTunder DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    RPTover DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    GFTFunder DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    GFTFover DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_full_report_rcd_date (`date`)
);

DELIMITER $$

DROP PROCEDURE IF EXISTS refresh_full_report_rcd_for_date $$
CREATE PROCEDURE refresh_full_report_rcd_for_date(IN p_report_date DATE)
refresh_block: BEGIN
    DECLARE v_ctc DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_rpt DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_gf DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_tf DECIMAL(15,2) DEFAULT 0.00;

    IF p_report_date IS NULL THEN
        LEAVE refresh_block;
    END IF;

    SELECT COALESCE(ROUND(SUM(c.TOTALAMOUNTPAID), 2), 0.00)
      INTO v_ctc
      FROM communitytaxcertificate c
     WHERE c.DATEISSUED = p_report_date;

    SELECT COALESCE(ROUND(SUM(r.BASIC_AND_SEF), 2), 0.00)
      INTO v_rpt
      FROM real_property_tax_payment r
     WHERE r.DATE = p_report_date;

    SELECT COALESCE(ROUND(SUM(pd.AMOUNTPAID), 2), 0.00)
      INTO v_gf
      FROM payment p
      JOIN paymentdetail pd
        ON pd.PAYMENT_ID = p.PAYMENT_ID
     WHERE p.PAYMENTDATE = p_report_date
       AND COALESCE(p.VOID_BV, 0) = 0
       AND p.AFTYPE NOT IN ('CTC', 'AF56')
       AND pd.FUNDTYPE_CT = 'GF'
       AND COALESCE(pd.STATUS_CT, '') <> 'CNL';

    SELECT COALESCE(ROUND(SUM(pd.AMOUNTPAID), 2), 0.00)
      INTO v_tf
      FROM payment p
      JOIN paymentdetail pd
        ON pd.PAYMENT_ID = p.PAYMENT_ID
     WHERE p.PAYMENTDATE = p_report_date
       AND COALESCE(p.VOID_BV, 0) = 0
       AND p.AFTYPE NOT IN ('CTC', 'AF56')
       AND pd.FUNDTYPE_CT = 'TF'
       AND COALESCE(pd.STATUS_CT, '') <> 'CNL';

    INSERT INTO full_report_rcd (`date`, ctc, rpt, GF, TF, gfAndTf, created_at, updated_at)
    VALUES (
        p_report_date,
        v_ctc,
        v_rpt,
        v_gf,
        v_tf,
        ROUND(v_gf + v_tf, 2),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        ctc = VALUES(ctc),
        rpt = VALUES(rpt),
        GF = VALUES(GF),
        TF = VALUES(TF),
        gfAndTf = VALUES(gfAndTf),
        updated_at = CURRENT_TIMESTAMP;
END $$

DROP TRIGGER IF EXISTS trg_full_report_rpt_ai $$
CREATE TRIGGER trg_full_report_rpt_ai
AFTER INSERT ON real_property_tax_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(NEW.DATE);
END $$

DROP TRIGGER IF EXISTS trg_full_report_rpt_au $$
CREATE TRIGGER trg_full_report_rpt_au
AFTER UPDATE ON real_property_tax_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATE);
    IF NOT (OLD.DATE <=> NEW.DATE) THEN
        CALL refresh_full_report_rcd_for_date(NEW.DATE);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_rpt_ad $$
CREATE TRIGGER trg_full_report_rpt_ad
AFTER DELETE ON real_property_tax_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATE);
END $$

DROP TRIGGER IF EXISTS trg_full_report_ctc_ai $$
CREATE TRIGGER trg_full_report_ctc_ai
AFTER INSERT ON communitytaxcertificate
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(NEW.DATEISSUED);
END $$

DROP TRIGGER IF EXISTS trg_full_report_ctc_au $$
CREATE TRIGGER trg_full_report_ctc_au
AFTER UPDATE ON communitytaxcertificate
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATEISSUED);
    IF NOT (OLD.DATEISSUED <=> NEW.DATEISSUED) THEN
        CALL refresh_full_report_rcd_for_date(NEW.DATEISSUED);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_ctc_ad $$
CREATE TRIGGER trg_full_report_ctc_ad
AFTER DELETE ON communitytaxcertificate
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATEISSUED);
END $$

DROP TRIGGER IF EXISTS trg_full_report_payment_ai $$
CREATE TRIGGER trg_full_report_payment_ai
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(NEW.PAYMENTDATE);
END $$

DROP TRIGGER IF EXISTS trg_full_report_payment_au $$
CREATE TRIGGER trg_full_report_payment_au
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.PAYMENTDATE);
    IF NOT (OLD.PAYMENTDATE <=> NEW.PAYMENTDATE) THEN
        CALL refresh_full_report_rcd_for_date(NEW.PAYMENTDATE);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_payment_ad $$
CREATE TRIGGER trg_full_report_payment_ad
AFTER DELETE ON payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.PAYMENTDATE);
END $$

DROP TRIGGER IF EXISTS trg_full_report_paymentdetail_ai $$
CREATE TRIGGER trg_full_report_paymentdetail_ai
AFTER INSERT ON paymentdetail
FOR EACH ROW
BEGIN
    DECLARE v_payment_date DATE;
    SELECT p.PAYMENTDATE
      INTO v_payment_date
      FROM payment p
     WHERE p.PAYMENT_ID = NEW.PAYMENT_ID
     LIMIT 1;

    CALL refresh_full_report_rcd_for_date(v_payment_date);
END $$

DROP TRIGGER IF EXISTS trg_full_report_paymentdetail_au $$
CREATE TRIGGER trg_full_report_paymentdetail_au
AFTER UPDATE ON paymentdetail
FOR EACH ROW
BEGIN
    DECLARE v_old_payment_date DATE;
    DECLARE v_new_payment_date DATE;

    SELECT p.PAYMENTDATE
      INTO v_old_payment_date
      FROM payment p
     WHERE p.PAYMENT_ID = OLD.PAYMENT_ID
     LIMIT 1;

    SELECT p.PAYMENTDATE
      INTO v_new_payment_date
      FROM payment p
     WHERE p.PAYMENT_ID = NEW.PAYMENT_ID
     LIMIT 1;

    CALL refresh_full_report_rcd_for_date(v_old_payment_date);

    IF NOT (v_old_payment_date <=> v_new_payment_date) THEN
        CALL refresh_full_report_rcd_for_date(v_new_payment_date);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_paymentdetail_ad $$
CREATE TRIGGER trg_full_report_paymentdetail_ad
AFTER DELETE ON paymentdetail
FOR EACH ROW
BEGIN
    DECLARE v_payment_date DATE;
    SELECT p.PAYMENTDATE
      INTO v_payment_date
      FROM payment p
     WHERE p.PAYMENT_ID = OLD.PAYMENT_ID
     LIMIT 1;

    CALL refresh_full_report_rcd_for_date(v_payment_date);
END $$

DELIMITER ;

INSERT INTO full_report_rcd (`date`)
SELECT src.report_date
FROM (
    SELECT DISTINCT DATE AS report_date
      FROM real_property_tax_payment
    UNION
    SELECT DISTINCT DATEISSUED AS report_date
      FROM communitytaxcertificate
    UNION
    SELECT DISTINCT PAYMENTDATE AS report_date
      FROM payment
     WHERE COALESCE(VOID_BV, 0) = 0
       AND AFTYPE NOT IN ('CTC', 'AF56')
) AS src
WHERE src.report_date IS NOT NULL
ON DUPLICATE KEY UPDATE `date` = VALUES(`date`);

UPDATE full_report_rcd fr
SET
    fr.ctc = COALESCE((
        SELECT ROUND(SUM(c.TOTALAMOUNTPAID), 2)
        FROM communitytaxcertificate c
        WHERE c.DATEISSUED = fr.`date`
    ), 0.00),
    fr.rpt = COALESCE((
        SELECT ROUND(SUM(r.BASIC_AND_SEF), 2)
        FROM real_property_tax_payment r
        WHERE r.DATE = fr.`date`
    ), 0.00),
    fr.GF = COALESCE((
        SELECT ROUND(SUM(pd.AMOUNTPAID), 2)
        FROM payment p
        JOIN paymentdetail pd
          ON pd.PAYMENT_ID = p.PAYMENT_ID
        WHERE p.PAYMENTDATE = fr.`date`
          AND COALESCE(p.VOID_BV, 0) = 0
          AND p.AFTYPE NOT IN ('CTC', 'AF56')
          AND pd.FUNDTYPE_CT = 'GF'
          AND COALESCE(pd.STATUS_CT, '') <> 'CNL'
    ), 0.00),
    fr.TF = COALESCE((
        SELECT ROUND(SUM(pd.AMOUNTPAID), 2)
        FROM payment p
        JOIN paymentdetail pd
          ON pd.PAYMENT_ID = p.PAYMENT_ID
        WHERE p.PAYMENTDATE = fr.`date`
          AND COALESCE(p.VOID_BV, 0) = 0
          AND p.AFTYPE NOT IN ('CTC', 'AF56')
          AND pd.FUNDTYPE_CT = 'TF'
          AND COALESCE(pd.STATUS_CT, '') <> 'CNL'
    ), 0.00),
    fr.gfAndTf = ROUND(
        COALESCE((
            SELECT SUM(pd.AMOUNTPAID)
            FROM payment p
            JOIN paymentdetail pd
              ON pd.PAYMENT_ID = p.PAYMENT_ID
            WHERE p.PAYMENTDATE = fr.`date`
              AND COALESCE(p.VOID_BV, 0) = 0
              AND p.AFTYPE NOT IN ('CTC', 'AF56')
              AND pd.FUNDTYPE_CT = 'GF'
              AND COALESCE(pd.STATUS_CT, '') <> 'CNL'
        ), 0.00)
        +
        COALESCE((
            SELECT SUM(pd.AMOUNTPAID)
            FROM payment p
            JOIN paymentdetail pd
              ON pd.PAYMENT_ID = p.PAYMENT_ID
            WHERE p.PAYMENTDATE = fr.`date`
              AND COALESCE(p.VOID_BV, 0) = 0
              AND p.AFTYPE NOT IN ('CTC', 'AF56')
              AND pd.FUNDTYPE_CT = 'TF'
              AND COALESCE(pd.STATUS_CT, '') <> 'CNL'
        ), 0.00),
        2
    ),
    fr.updated_at = CURRENT_TIMESTAMP;
