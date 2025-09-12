import redis
import json
import os
from datetime import datetime, timedelta
import hashlib

class CacheManager:
    def __init__(self):
        """Initialize cache manager with Redis connection"""
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        try:
            self.redis_client = redis.from_url(self.redis_url)
            self.redis_client.ping()  # Test connection
        except Exception as e:
            print(f"Warning: Redis connection failed: {e}")
            self.redis_client = None
        
        # Cache expiration times (in seconds)
        self.expiration_times = {
            'document_summary': 24 * 60 * 60,  # 24 hours
            'intent_parse': 12 * 60 * 60,      # 12 hours
            'companies': 6 * 60 * 60,          # 6 hours
            'contacts': 6 * 60 * 60,           # 6 hours
            'emails': 2 * 60 * 60,             # 2 hours
        }
    
    def _get_cache_key(self, cache_type: str, identifier: str) -> str:
        """Generate a cache key for the given type and identifier"""
        return f"agentic_clubs:{cache_type}:{identifier}"
    
    def _is_redis_available(self) -> bool:
        """Check if Redis is available"""
        return self.redis_client is not None
    
    def cache_document_summary(self, content_hash: str, summary: str) -> bool:
        """Cache a document summary"""
        if not self._is_redis_available():
            return False
        
        try:
            cache_key = self._get_cache_key('document_summary', content_hash)
            cache_data = {
                'summary': summary,
                'timestamp': datetime.now().isoformat(),
                'type': 'document_summary'
            }
            
            self.redis_client.setex(
                cache_key,
                self.expiration_times['document_summary'],
                json.dumps(cache_data)
            )
            return True
        except Exception as e:
            print(f"Error caching document summary: {e}")
            return False
    
    def get_document_summary(self, content_hash: str) -> str | None:
        """Retrieve a cached document summary"""
        if not self._is_redis_available():
            return None
        
        try:
            cache_key = self._get_cache_key('document_summary', content_hash)
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data.get('summary')
            return None
        except Exception as e:
            print(f"Error retrieving document summary: {e}")
            return None
    
    def cache_intent_parse(self, cache_key: str, intent_data: dict) -> bool:
        """Cache parsed intent data"""
        if not self._is_redis_available():
            return False
        
        try:
            full_cache_key = self._get_cache_key('intent_parse', cache_key)
            cache_data = {
                **intent_data,
                'timestamp': datetime.now().isoformat(),
                'type': 'intent_parse'
            }
            
            self.redis_client.setex(
                full_cache_key,
                self.expiration_times['intent_parse'],
                json.dumps(cache_data)
            )
            return True
        except Exception as e:
            print(f"Error caching intent parse: {e}")
            return False
    
    def get_intent_parse(self, cache_key: str) -> dict | None:
        """Retrieve cached intent parse data"""
        if not self._is_redis_available():
            return None
        
        try:
            full_cache_key = self._get_cache_key('intent_parse', cache_key)
            cached_data = self.redis_client.get(full_cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                # Remove metadata fields
                data.pop('timestamp', None)
                data.pop('type', None)
                return data
            return None
        except Exception as e:
            print(f"Error retrieving intent parse: {e}")
            return None
    
    def cache_companies(self, cache_key: str, companies: list) -> bool:
        """Cache discovered companies"""
        if not self._is_redis_available():
            return False
        
        try:
            full_cache_key = self._get_cache_key('companies', cache_key)
            cache_data = {
                'companies': companies,
                'timestamp': datetime.now().isoformat(),
                'type': 'companies'
            }
            
            self.redis_client.setex(
                full_cache_key,
                self.expiration_times['companies'],
                json.dumps(cache_data)
            )
            return True
        except Exception as e:
            print(f"Error caching companies: {e}")
            return False
    
    def get_companies(self, cache_key: str) -> list | None:
        """Retrieve cached companies data"""
        if not self._is_redis_available():
            return None
        
        try:
            full_cache_key = self._get_cache_key('companies', cache_key)
            cached_data = self.redis_client.get(full_cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data.get('companies')
            return None
        except Exception as e:
            print(f"Error retrieving companies: {e}")
            return None
    
    def cache_contacts(self, cache_key: str, contacts: list) -> bool:
        """Cache discovered contacts"""
        if not self._is_redis_available():
            return False
        
        try:
            full_cache_key = self._get_cache_key('contacts', cache_key)
            cache_data = {
                'contacts': contacts,
                'timestamp': datetime.now().isoformat(),
                'type': 'contacts'
            }
            
            self.redis_client.setex(
                full_cache_key,
                self.expiration_times['contacts'],
                json.dumps(cache_data)
            )
            return True
        except Exception as e:
            print(f"Error caching contacts: {e}")
            return False
    
    def get_contacts(self, cache_key: str) -> list | None:
        """Retrieve cached contacts data"""
        if not self._is_redis_available():
            return None
        
        try:
            full_cache_key = self._get_cache_key('contacts', cache_key)
            cached_data = self.redis_client.get(full_cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data.get('contacts')
            return None
        except Exception as e:
            print(f"Error retrieving contacts: {e}")
            return None
    
    def cache_emails(self, cache_key: str, emails: list) -> bool:
        """Cache generated email drafts"""
        if not self._is_redis_available():
            return False
        
        try:
            full_cache_key = self._get_cache_key('emails', cache_key)
            cache_data = {
                'emails': emails,
                'timestamp': datetime.now().isoformat(),
                'type': 'emails'
            }
            
            self.redis_client.setex(
                full_cache_key,
                self.expiration_times['emails'],
                json.dumps(cache_data)
            )
            return True
        except Exception as e:
            print(f"Error caching emails: {e}")
            return False
    
    def get_emails(self, cache_key: str) -> list | None:
        """Retrieve cached email drafts"""
        if not self._is_redis_available():
            return None
        
        try:
            full_cache_key = self._get_cache_key('emails', cache_key)
            cached_data = self.redis_client.get(full_cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                return data.get('emails')
            return None
        except Exception as e:
            print(f"Error retrieving emails: {e}")
            return None
    
    def clear_all(self) -> bool:
        """Clear all cached data"""
        if not self._is_redis_available():
            return False
        
        try:
            # Get all keys matching our pattern
            pattern = "agentic_clubs:*"
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
            
            return True
        except Exception as e:
            print(f"Error clearing cache: {e}")
            return False
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        if not self._is_redis_available():
            return {'error': 'Redis not available'}
        
        try:
            stats = {}
            total_keys = 0
            
            for cache_type in self.expiration_times.keys():
                pattern = f"agentic_clubs:{cache_type}:*"
                keys = self.redis_client.keys(pattern)
                count = len(keys)
                stats[cache_type] = {
                    'count': count,
                    'expiration_hours': self.expiration_times[cache_type] // 3600
                }
                total_keys += count
            
            stats['total_keys'] = total_keys
            stats['redis_available'] = True
            
            return stats
        except Exception as e:
            return {'error': str(e), 'redis_available': False}
    
    def get_cache_hit_rate(self, cache_type: str) -> float:
        """Calculate cache hit rate for a specific type"""
        if not self._is_redis_available():
            return 0.0
        
        try:
            # This would require tracking hits/misses in a real implementation
            # For now, return a placeholder
            return 0.85  # 85% hit rate placeholder
        except Exception:
            return 0.0
    
    def cleanup_expired(self) -> int:
        """Clean up expired cache entries (Redis handles this automatically)"""
        # Redis automatically removes expired keys
        # This method is for manual cleanup if needed
        return 0



