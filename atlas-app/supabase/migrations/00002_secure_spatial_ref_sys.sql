-- Migration: Secure PostGIS system table spatial_ref_sys from public API exposure
-- Context: spatial_ref_sys is an internal table created by the PostGIS extension containing EPSG projections.
-- It contains no sensitive user data, but PostgREST exposes public tables by default.
-- Revoking API access prevents external queries via anon and authenticated roles.

REVOKE ALL ON public.spatial_ref_sys FROM anon, authenticated;

