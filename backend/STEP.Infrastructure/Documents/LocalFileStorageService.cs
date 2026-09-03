using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using STEP.Application.Common.Interfaces;

namespace STEP.Infrastructure.Documents
{
    /// <summary>
    /// Writes candidate documents to local server disk under FileStorage:BasePath (default: App_Data/uploads).
    /// Built for on-premise and company-hosted deployments with resilient path resolution.
    /// </summary>
    public class LocalFileStorageService(
        IConfiguration configuration,
        ILogger<LocalFileStorageService> logger) : IFileStorageService
    {
        public string ProviderName => "Local";

        private string BasePath
        {
            get
            {
                var configured = configuration["FileStorage:BasePath"];
                if (string.IsNullOrWhiteSpace(configured))
                {
                    configured = Environment.GetEnvironmentVariable("FILE_STORAGE_PATH");
                }

                if (!string.IsNullOrWhiteSpace(configured))
                {
                    return Path.GetFullPath(configured);
                }

                // Deterministic fallback: prefer AppContext.BaseDirectory (always within the application folder,
                // avoiding Linux systemd or Windows IIS current directory pitfalls where GetCurrentDirectory() is / or System32)
                var defaultBase = Path.Combine(AppContext.BaseDirectory, "App_Data", "uploads");
                return Path.GetFullPath(defaultBase);
            }
        }

        public async Task<string> SaveAsync(string relativeFolder, string fileName, Stream content, CancellationToken cancellationToken = default)
        {
            var cleanFolder = (relativeFolder ?? string.Empty).Trim().TrimStart('/', '\\')
                .Replace('/', Path.DirectorySeparatorChar)
                .Replace('\\', Path.DirectorySeparatorChar);

            var folder = Path.Combine(BasePath, cleanFolder);
            Directory.CreateDirectory(folder);

            var safeFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
            var fullPath = Path.Combine(folder, safeFileName);

            await using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await content.CopyToAsync(fileStream, cancellationToken);
            }

            logger.LogInformation("[LocalFileStorageService] Document '{FileName}' saved successfully to '{FullPath}'", fileName, fullPath);

            return Path.Combine(relativeFolder ?? string.Empty, safeFileName).Replace('\\', '/');
        }

        public async Task<byte[]> ReadAsync(string relativePath, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                throw new FileNotFoundException("Cannot read document: file path is null or empty.");
            }

            var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);

            var fullPath = Path.IsPathRooted(normalized)
                ? normalized
                : Path.Combine(BasePath, normalized);

            if (!File.Exists(fullPath))
            {
                // Fallback 1: Check relative to Directory.GetCurrentDirectory()
                var altCurDir = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "uploads", normalized);
                if (File.Exists(altCurDir))
                {
                    fullPath = altCurDir;
                }
                else
                {
                    // Fallback 2: Check relative to AppContext.BaseDirectory
                    var altBaseDir = Path.Combine(AppContext.BaseDirectory, "App_Data", "uploads", normalized);
                    if (File.Exists(altBaseDir))
                    {
                        fullPath = altBaseDir;
                    }
                }
            }

            if (!File.Exists(fullPath))
            {
                logger.LogWarning("[LocalFileStorageService] File not found at '{FullPath}' (relative: '{RelativePath}', BasePath: '{BasePath}')", fullPath, relativePath, BasePath);
                throw new FileNotFoundException($"File not found on server: {relativePath}", fullPath);
            }

            return await File.ReadAllBytesAsync(fullPath, cancellationToken);
        }
    }
}
