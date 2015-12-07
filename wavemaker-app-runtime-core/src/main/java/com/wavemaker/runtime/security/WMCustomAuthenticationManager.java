/**
 * Copyright © 2015 WaveMaker, Inc.
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
package com.wavemaker.runtime.security;

import javax.servlet.http.HttpServletRequest;

/**
 * The class which needs to be implemented by users who would like to have their custom authentication mechanism
 * @author Uday Shankar
 */
public interface WMCustomAuthenticationManager {

    /**
     * should return WMUser object if the authentication details can be extracted from httpServletRequest through cookie or some other headers.
     * Otherwise the method should return null
     * @param httpServletRequest
     * @return
     */
    public WMUser authenticate(HttpServletRequest httpServletRequest);
}
