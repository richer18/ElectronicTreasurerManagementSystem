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
      FROM community_tax_certificate_payment c
     WHERE c.DATEISSUED = p_report_date
       AND COALESCE(c.IS_CANCELLED, 0) = 0;

    SELECT COALESCE(ROUND(SUM(r.BASIC_AND_SEF), 2), 0.00)
      INTO v_rpt
      FROM real_property_tax_payment r
     WHERE r.DATE = p_report_date
       AND COALESCE(r.IS_CANCELLED, 0) = 0;

    SELECT COALESCE(ROUND(SUM(gf.AMOUNTPAID), 2), 0.00)
      INTO v_gf
      FROM general_fund_payment gf
     WHERE DATE(gf.PAYMENTDATE) = p_report_date
       AND COALESCE(gf.VOID_BV, 0) = 0
       AND COALESCE(gf.PAYMENT_STATUS_CT, 'SAV') <> 'CNL'
       AND COALESCE(gf.PAYMENTDETAIL_STATUS_CT, 'SAV') <> 'CNL';

    SELECT COALESCE(ROUND(SUM(tf.TOTAL), 2), 0.00)
      INTO v_tf
      FROM trust_fund_payment tf
     WHERE tf.DATE = p_report_date
       AND COALESCE(tf.IS_CANCELLED, 0) = 0;

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
AFTER INSERT ON community_tax_certificate_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(NEW.DATEISSUED);
END $$

DROP TRIGGER IF EXISTS trg_full_report_ctc_au $$
CREATE TRIGGER trg_full_report_ctc_au
AFTER UPDATE ON community_tax_certificate_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATEISSUED);
    IF NOT (OLD.DATEISSUED <=> NEW.DATEISSUED) THEN
        CALL refresh_full_report_rcd_for_date(NEW.DATEISSUED);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_ctc_ad $$
CREATE TRIGGER trg_full_report_ctc_ad
AFTER DELETE ON community_tax_certificate_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATEISSUED);
END $$

DROP TRIGGER IF EXISTS trg_full_report_gf_ai $$
CREATE TRIGGER trg_full_report_gf_ai
AFTER INSERT ON general_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(DATE(NEW.PAYMENTDATE));
END $$

DROP TRIGGER IF EXISTS trg_full_report_gf_au $$
CREATE TRIGGER trg_full_report_gf_au
AFTER UPDATE ON general_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(DATE(OLD.PAYMENTDATE));
    IF NOT (DATE(OLD.PAYMENTDATE) <=> DATE(NEW.PAYMENTDATE)) THEN
        CALL refresh_full_report_rcd_for_date(DATE(NEW.PAYMENTDATE));
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_gf_ad $$
CREATE TRIGGER trg_full_report_gf_ad
AFTER DELETE ON general_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(DATE(OLD.PAYMENTDATE));
END $$

DROP TRIGGER IF EXISTS trg_full_report_tf_ai $$
CREATE TRIGGER trg_full_report_tf_ai
AFTER INSERT ON trust_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(NEW.DATE);
END $$

DROP TRIGGER IF EXISTS trg_full_report_tf_au $$
CREATE TRIGGER trg_full_report_tf_au
AFTER UPDATE ON trust_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATE);
    IF NOT (OLD.DATE <=> NEW.DATE) THEN
        CALL refresh_full_report_rcd_for_date(NEW.DATE);
    END IF;
END $$

DROP TRIGGER IF EXISTS trg_full_report_tf_ad $$
CREATE TRIGGER trg_full_report_tf_ad
AFTER DELETE ON trust_fund_payment
FOR EACH ROW
BEGIN
    CALL refresh_full_report_rcd_for_date(OLD.DATE);
END $$

DELIMITER ;

INSERT INTO full_report_rcd (`date`)
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
ON DUPLICATE KEY UPDATE `date` = VALUES(`date`);

UPDATE full_report_rcd fr
SET
    fr.ctc = COALESCE((
        SELECT ROUND(SUM(c.TOTALAMOUNTPAID), 2)
        FROM community_tax_certificate_payment c
        WHERE c.DATEISSUED = fr.`date`
          AND COALESCE(c.IS_CANCELLED, 0) = 0
    ), 0.00),
    fr.rpt = COALESCE((
        SELECT ROUND(SUM(r.BASIC_AND_SEF), 2)
        FROM real_property_tax_payment r
        WHERE r.DATE = fr.`date`
          AND COALESCE(r.IS_CANCELLED, 0) = 0
    ), 0.00),
    fr.GF = COALESCE((
        SELECT ROUND(SUM(gf.AMOUNTPAID), 2)
        FROM general_fund_payment gf
        WHERE DATE(gf.PAYMENTDATE) = fr.`date`
          AND COALESCE(gf.VOID_BV, 0) = 0
          AND COALESCE(gf.PAYMENT_STATUS_CT, 'SAV') <> 'CNL'
          AND COALESCE(gf.PAYMENTDETAIL_STATUS_CT, 'SAV') <> 'CNL'
    ), 0.00),
    fr.TF = COALESCE((
        SELECT ROUND(SUM(tf.TOTAL), 2)
        FROM trust_fund_payment tf
        WHERE tf.DATE = fr.`date`
          AND COALESCE(tf.IS_CANCELLED, 0) = 0
    ), 0.00),
    fr.gfAndTf = ROUND(
        COALESCE((
            SELECT SUM(gf.AMOUNTPAID)
            FROM general_fund_payment gf
            WHERE DATE(gf.PAYMENTDATE) = fr.`date`
              AND COALESCE(gf.VOID_BV, 0) = 0
              AND COALESCE(gf.PAYMENT_STATUS_CT, 'SAV') <> 'CNL'
              AND COALESCE(gf.PAYMENTDETAIL_STATUS_CT, 'SAV') <> 'CNL'
        ), 0.00)
        +
        COALESCE((
            SELECT SUM(tf.TOTAL)
            FROM trust_fund_payment tf
            WHERE tf.DATE = fr.`date`
              AND COALESCE(tf.IS_CANCELLED, 0) = 0
        ), 0.00),
        2
    ),
    fr.updated_at = CURRENT_TIMESTAMP;
