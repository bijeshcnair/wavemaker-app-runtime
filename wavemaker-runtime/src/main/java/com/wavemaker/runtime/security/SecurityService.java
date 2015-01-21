/**
 * Copyright (C) 2014 WaveMaker, Inc. All rights reserved.
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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.cas.authentication.CasAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.wavemaker.runtime.WMAppContext;

/**
 * The Security Service provides interfaces to access authentication and authorization information in the system.
 * 
 * @author Frankie Fu
 */
@Service
public class SecurityService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);

    private String rolePrefix = "ROLE_";
    private String noRolesMarkerRole;

    private List<String> roles;

    private Map<String, List<Rule>> roleMap;

    private Boolean securityEnabled;

    public SecurityService() {
    }

    public static Logger getLogger() {
        return logger;
    }

    /**
     * Checks whether the security is enabled or not. It returns true if it is enable, else, false.
     *
     * @return true if the security is enabled; otherwise, false.
     */
    public Boolean isSecurityEnabled() {
        if(securityEnabled == null) {
            try {
                WMSecurityConfigStore wmSecurityConfigStore = WMAppContext.getInstance().getSpringBean(WMSecurityConfigStore.class);
                securityEnabled = wmSecurityConfigStore.isEnforceSecurity();
            } catch (NoSuchBeanDefinitionException e) {
                securityEnabled = false;
            }
        }
        return securityEnabled;
    }

    public void setSecurityEnabled(Boolean securityEnabled) {
        this.securityEnabled = securityEnabled;
    }

    /**
     * Checks whether the user has been authenticated or not depending on authentication object.
     *
     * @return true if the user was authenticated; otherwise, false.
     */
    public boolean isAuthenticated() {
        return getAuthenticatedAuthentication() != null;
    }

    /**
     * Logs the current principal out. The principal is the one in the security context.
     *
     * @return void (nothing).
     */
    public void logout() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    private WMUserDetails getWMUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if(principal instanceof WMUserDetails) {
                return (WMUserDetails) principal;
            }
        }
        return null;
    }

    /**
     * Get Current LoggedIn User.
     * If security is enabled and user is authenticated then other fields like userId,
     * userName, tenantId, userRoles etc are also set, otherwise, only securityEnabled value is set.
     *
     * @return WMCurrentUser type.
     */
    public WMCurrentUser getLoggedInUser() {
        WMCurrentUser wmCurrentUser = new WMCurrentUser();
        if(isSecurityEnabled() && isAuthenticated()){
            wmCurrentUser.setAuthenticated(isAuthenticated());
            wmCurrentUser.setSecurityEnabled(isSecurityEnabled());
            wmCurrentUser.setUserId(getUserId());
            wmCurrentUser.setUserName(getUserName());
            wmCurrentUser.setTenantId(getTenantId());
            wmCurrentUser.setUserRoles(getUserRoles());
            if(getWMUserDetails()!=null){
                wmCurrentUser.setLoginTime(getWMUserDetails().getLoginTime());
            }
        } else {
            wmCurrentUser.setSecurityEnabled(isSecurityEnabled());
        }
        return wmCurrentUser;
    }

    /**
     * Returns the user name of the principal in the current security context.
     * If the {@link org.springframework.security.core.userdetails.UserDetails} obtained from authentication is an instance of {@link WMUserDetails},then user's long name is returned from WMUserDetails,
     * else returns the username from authentication Object.
     * Second case happens when services like ldap are used to authenticate
     * @return The user name.
     */
    public String getUserName() {
        WMUserDetails wmUserDetails = getWMUserDetails();
        if (wmUserDetails != null) {
            return wmUserDetails.getUsername();
        }
        if(getAuthenticatedAuthentication()!=null){
            return getAuthenticatedAuthentication().getName();
        }
        return null;
    }

    /**
     * Returns the user id of the principal in the current security context, otherwise, it returns name of the authenticated user..
     * 
     * @return String value, which will contain userId.
     */
    public String getUserId() {
        WMUserDetails wmUserDetails = getWMUserDetails();
        if(wmUserDetails != null){
            return wmUserDetails.getUserId();
        }
        if(getAuthenticatedAuthentication()!=null){
            return getAuthenticatedAuthentication().getName();
        }
        return null;
    }

    /**
     * If authentication is null then it returns empty String array. If not then it will retrieve the authority and process the roleName in the spring format before returning and then return.
     * 
     * @return String array with roles or empty depending on authentication object.
     */
    public String[] getUserRoles() {
        Authentication authentication = getAuthenticatedAuthentication();
        if (authentication == null) {
            return new String[0];
        }
        Collection<? extends GrantedAuthority>  authorities = authentication.getAuthorities(); 
        List<String> roleNames = new ArrayList<String>();
        for (GrantedAuthority authority : authorities) {
            String roleName = authority.getAuthority();
            String realRoleName = null;
            if (this.getRolePrefix() == null) {
                realRoleName = roleName;
            } else {
                if (roleName.startsWith(this.getRolePrefix())) {
                    // take out the prefix and get the actual role name
                    realRoleName = roleName.substring(this.getRolePrefix().length());
                } else {
                    logger.warn("Role " + roleName + " does not use the prefix " + this.getRolePrefix() + ". This may cause problems");
                    realRoleName = roleName;
                }
            }

            // make sure the role is not the maker for no roles
            if (realRoleName != null) {
                roleNames.add(realRoleName);
            }
        }

        return roleNames.toArray(new String[0]);
    }

    private static Authentication getAuthenticatedAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication instanceof AnonymousAuthenticationToken ? null : authentication;
    }

    /**
     * If authentication is null then it returns 0. Otherwise, it retrieves tenantId from the authentication cobject and return that value.
     *
     * @return The tenant Id or 0 if authentication is null.
     */
    public static int getTenantId() {
        Authentication authentication = getAuthenticatedAuthentication();
        if (authentication != null) {
            if (authentication.getPrincipal() instanceof WMUserDetails) {
                WMUserDetails principal = (WMUserDetails) authentication.getPrincipal();
                return principal.getTenantId();
            }
        }
        return 0;
    }

    /**
     * This method returns a proxy ticket to the caller. The serviceUrl must be the EXACT url of the service that you
     * are using the ticket to call.
     *
     * @param serviceUrl The url of the service, protected by CAS, that you want to call.
     * @return A 'use once' proxy service ticket, or null if a ticket cannot be retrieved.
     */
    public static String getCASProxyTicket(String serviceUrl) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String ticket = null;
        try {
            if (auth instanceof CasAuthenticationToken) {
                ticket = ((CasAuthenticationToken) auth).getAssertion().getPrincipal().getProxyTicketFor(serviceUrl);
            }
        } catch (Exception e) {
            logger.error("The CASSecurityService.getServiceTicket() has failed", e);
        }
        return ticket;
    }

    /**
     * It returns Login Time of the current user when userDetail object in current security context is not null, otherwise, it returns 0.
     *
     * @return login tine in milliseconds (long value).
     */
    public long getLoginTime() {
        WMUserDetails wmUserDetails = getWMUserDetails();
        if(wmUserDetails != null)
            return wmUserDetails.getLoginTime();
        return 0L;
    }

    /**
     * Checks if the Principal is allowed to perform the specified action on the specified resources. The Principal is
     * obtained from the SecurityContext in the current execution thread.
     * 
     * @param resources A set of resources.
     * @param action The action to be checked.
     * @return True if the Principal is allowed to perform such action; false otherwise.
     */
    public boolean isAllowed(Set<Resource> resources, String action) {
        String[] roleNames = getUserRoles();
        for (String roleName : roleNames) {
            if (!isAllowed(roleName, resources, action)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if the specified role has permission to perform the specified action on the specified resources.
     * 
     * @param roleName The name of the role to be checked for permission.
     * @param resources A set of resources.
     * @param action The action to be checked.
     * @return True if the role is allowed to perform such action; false otherwise.
     */
    public boolean isAllowed(String roleName, Set<Resource> resources, String action) {
        List<Rule> rules = this.roleMap.get(roleName);
        if (rules != null) {
            for (Rule rule : rules) {
                if (action.equals(rule.getAction())) {
                    for (Resource ruleResource : rule.getResources()) {
                        for (Resource queryResource : resources) {
                            if (queryResource.matchResource(ruleResource)) {
                                if (!rule.isAllowed()) {
                                    // deny wins, so simply returns false
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    public String getRolePrefix() {
        return rolePrefix;
    }

    public void setRolePrefix(String rolePrefix) {
        this.rolePrefix = rolePrefix;
    }

    public String getNoRolesMarkerRole() {
        return this.noRolesMarkerRole;
    }

    public void setNoRolesMarkerRole(String noRolesMarkerRole) {
        this.noRolesMarkerRole = noRolesMarkerRole;
    }

    public List<String> getRoles() {
        return this.roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Map<String, List<Rule>> getRoleMap() {
        return this.roleMap;
    }

    public void setRoleMap(Map<String, List<Rule>> roleMap) {
        this.roleMap = roleMap;
    }

}
