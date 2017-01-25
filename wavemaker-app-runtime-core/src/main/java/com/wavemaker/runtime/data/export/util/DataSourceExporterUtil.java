package com.wavemaker.runtime.data.export.util;

import java.lang.reflect.Method;
import java.sql.ResultSet;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.hibernate.ScrollableResults;
import org.hibernate.internal.AbstractScrollableResults;

import com.wavemaker.commons.WMRuntimeException;

/**
 * @author <a href="mailto:anusha.dharmasagar@wavemaker.com">Anusha Dharmasagar</a>
 * @since 07/11/16
 */
public class DataSourceExporterUtil {


    public static ResultSet constructResultSet(ScrollableResults scroll) {
        try {
            Method resultSetMethod = AbstractScrollableResults.class.getDeclaredMethod("getResultSet");
            resultSetMethod.setAccessible(true);
            return (ResultSet) resultSetMethod.invoke(scroll);
        } catch (Exception e) {
            throw new WMRuntimeException("Failed to fetch ResultSet", e);
        }
    }


    public static void setCellValue(Object data, final Cell cell) {
        try {
            if (data != null) {
                Row row = cell.getRow();
                Sheet sheet = row.getSheet();
                if (!byte[].class.equals(data.getClass())) {
                    cell.setCellValue(data.toString());
                } else {
                    Drawing drawing = sheet.createDrawingPatriarch();
                    ImageUtils.addImageToSheet(cell.getColumnIndex(), row.getRowNum(), sheet, drawing, (byte[]) data,
                            Workbook.PICTURE_TYPE_JPEG, 20, 30, ImageUtils.EXPAND_ROW_AND_COLUMN);

                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while exporting data to report", e);
        }
    }
}
