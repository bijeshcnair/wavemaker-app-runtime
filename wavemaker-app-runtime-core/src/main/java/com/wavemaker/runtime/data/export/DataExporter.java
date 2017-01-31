/**
 * Copyright © 2013 - 2017 WaveMaker, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.wavemaker.runtime.data.export;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.poi.ss.usermodel.Workbook;

import com.wavemaker.runtime.data.export.util.CSVConverterUtil;
import com.wavemaker.commons.WMRuntimeException;

/**
 * @author <a href="mailto:anusha.dharmasagar@wavemaker.com">Anusha Dharmasagar</a>
 * @since 8/11/16
 */
public abstract class DataExporter {

    public abstract ByteArrayOutputStream export(ExportType exportType, Class<?> responseType);

    protected ByteArrayOutputStream exportWorkbook(final Workbook workbook, final ExportType exportType) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            if (exportType == ExportType.EXCEL) {
                workbook.write(outputStream);
            } else if (exportType == ExportType.CSV) {
                CSVConverterUtil CSVConverterUtil = new CSVConverterUtil(workbook);
                CSVConverterUtil.convert(outputStream);
            }
            return outputStream;
        } catch (IOException e) {
            throw new WMRuntimeException("Error while exporting data", e);
        }
    }
}
