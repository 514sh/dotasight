import functools
import time


def timer(label: str = ""):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            t0 = time.time()
            result = await func(*args, **kwargs)
            elapsed = time.time() - t0
            name = label or func.__name__
            print(f"⏱️ {name}: {elapsed:.2f}s")
            return result

        return wrapper

    return decorator
